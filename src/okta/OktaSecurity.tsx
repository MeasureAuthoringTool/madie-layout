import React, { useEffect, useMemo, useState } from "react";
import { Security } from "@okta/okta-react";
import { OktaAuth, toRelativeUrl } from "@okta/okta-auth-js";
import { getOktaConfig } from "@madie/madie-util";
import Router from "../router/Router";
import {
  consumeTimeoutReturnUrl,
  setTimeoutReturnUrl,
} from "../services/timeoutReturnUrl";

interface OktaConfig {
  baseUrl: string;
  issuer: string;
  clientId: string;
  redirectUri: string;
}

/**
 * How long one successful Okta session check is trusted before we verify
 * against the server again.
 *
 * Why this cache exists: `transformAuthState` runs on EVERY auth-state
 * recalculation — page load, token renewal, and (because `syncStorage` is on)
 * every token event mirrored from other tabs. Each run used to make a network
 * call to /api/v1/sessions/me, and `session.exists()` reports `false` for ANY
 * failure (network blip, 429 rate limit, aborted request), not just a dead
 * session. So a burst of refreshes/route changes could hammer that endpoint
 * and a single transient failure logged an active user out with no warning.
 * Trusting a recent positive result removes both the call volume and the
 * false-logout window.
 */
export const SESSION_CHECK_TTL_MS = 5 * 60 * 1000; // 5 minutes
let lastSessionConfirmedAt = 0;

/**
 * Test-only: module state survives between test cases, so tests reset the
 * session-check cache here to keep each case independent.
 */
export const resetSessionCheckCache = (): void => {
  lastSessionConfirmedAt = 0;
};

/**
 * Extra auth check layered on top of Okta's default (unexpired tokens exist).
 *
 * Why: tokens sitting in localStorage don't guarantee the user still has a
 * live Okta SSO session (it may have been revoked or timed out server-side).
 * Okta calls this hook every time it recalculates auth state; we confirm the
 * server-side session before treating the user as authenticated — but only
 * once per SESSION_CHECK_TTL_MS, and with one retry, so transient network
 * failures can't end a valid session.
 */
export const transformAuthState = async (oktaAuth, authState) => {
  // verifies unexpired tokens are available from the tokenManager (default behavior)
  if (localStorage.getItem("madieDebug") || (window as any).madieDebug) {
    // eslint-disable-next-line no-console
    console.log(`[${new Date()}] - transformAuthState oktaAuth: `, oktaAuth);
    // eslint-disable-next-line no-console
    console.log(
      `[${new Date()}] - transformAuthState authState: `,
      JSON.stringify(authState, null, 2)
    );
  }
  if (!authState.isAuthenticated) {
    return authState;
  }
  // extra requirement: user must have valid Okta session.
  const now = Date.now();
  if (now - lastSessionConfirmedAt < SESSION_CHECK_TTL_MS) {
    return authState;
  }
  let sessionExists = await oktaAuth.session.exists();
  if (!sessionExists) {
    // `session.exists()` returns false for BOTH "session is gone" and "the
    // request failed". Retry once so a transient network failure doesn't end
    // an otherwise-valid session.
    sessionExists = await oktaAuth.session.exists();
  }
  if (sessionExists) {
    lastSessionConfirmedAt = now;
  }
  authState.isAuthenticated = sessionExists;
  return authState;
};

function OktaSecurity() {
  const [oktaConfig, setOktaConfig] = useState<OktaConfig>();
  const [oktaConfigErr, setOktaConfigErr] = useState<string>();

  const customAuthHandler = () => {
    setTimeoutReturnUrl(
      `${window.location.pathname}${window.location.search}${window.location.hash}`
    );
    window.location.href = "/login";
  };

  const restoreOriginalUri = async (_oktaAuth, originalUri) => {
    // To avoid completely refactoring this app:
    // previously we had two routers to have access to history.replace. router-dom6 does not like this.
    // New method is to just update the url using native function. Same with customAuthHandler.
    // This may also very likely not even be necessary at all with router-dom 6 based on how the routes are set
    const timeoutReturnUrl = consumeTimeoutReturnUrl();
    const redirectTarget = timeoutReturnUrl || originalUri || "/measures";
    window.location.assign(
      toRelativeUrl(redirectTarget, window.location.origin)
    );
  };

  useEffect(() => {
    getOktaConfig()
      .then((config) => {
        setOktaConfig(config);
      })
      .catch((err) => {
        console.error(err);
        setOktaConfigErr(
          "Unable to load Login page, Please contact administration"
        );
      });
  }, []);

  const routerProps = {
    props: {
      oktaSignInConfig: {
        ...oktaConfig,
        authParams: {
          ...oktaConfig,
        },
      },
    },
  };

  // Memoized so the OktaAuth instance (and its token/renew/leader-election
  // services) is created exactly once per loaded config. Re-instantiating it
  // on a re-render restarts every service mid-flight, which destabilizes
  // renewals and cross-tab sync.
  const oktaAuth = useMemo(
    () =>
      oktaConfig
        ? new OktaAuth({
            ...oktaConfig, // other config
            transformAuthState,
            // Keep tokens valid and synchronized across all open tabs so background
            // tabs don't hit auth errors / unexpected logouts.
            // NOTE: `scopes` (incl. `offline_access` for refresh-token silent renewal)
            // is intentionally left to the env-provided oktaConfig for now — enabling
            // offline_access depends on the Okta/HARP app allowing refresh tokens and
            // is being decided separately.
            tokenManager: {
              autoRenew: true, // expired tokens are renewed, not removed
              storage: "localStorage", // required for cross-tab token sync
            },
            services: {
              autoRenew: true,
              syncStorage: true, // propagate renewed tokens to all tabs via storage events
              renewOnTabActivation: true, // refresh tokens when a background tab regains focus
              tabInactivityDuration: 1800, // seconds (30 min) — matches the idle timeout
            },
          })
        : null,
    [oktaConfig]
  );

  if (!!oktaConfig) {
    return (
      <Security
        oktaAuth={oktaAuth}
        onAuthRequired={customAuthHandler}
        restoreOriginalUri={restoreOriginalUri}
      >
        <Router {...routerProps} />
      </Security>
    );
  } else {
    return (
      <div data-testid="login-page-message">
        {oktaConfigErr ? oktaConfigErr : "Loading..."}
      </div>
    );
  }
}
export default OktaSecurity;
