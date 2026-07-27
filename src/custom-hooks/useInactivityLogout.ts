import { useEffect, useRef } from "react";
import { useOktaAuth } from "@okta/okta-react";
import {
  useMeasureServiceApi,
  useCqlLibraryServiceApi,
} from "@madie/madie-util";
import {
  activityTracker,
  MADiE_LAST_ACTIVITY,
} from "../services/activityTracker";
import { performLogoutCleanup } from "../services/logoutCleanup";

/**
 * Interval (ms) at which the hook checks whether the idle timeout has been
 * exceeded.
 */
export const IDLE_CHECK_INTERVAL_MS = 30_000; // 30 seconds

/**
 * useInactivityLogout
 *
 * Automatically signs the user out after a period of inactivity.
 *
 * While the user is authenticated, this hook:
 *   1. Starts activity tracking (attaches the DOM event listeners defined by
 *      `activityTracker` — mousemove, mousedown, keydown, scroll, touchstart,
 *      click — and records an initial activity timestamp).
 *   2. Runs a periodic check (every {@link IDLE_CHECK_INTERVAL_MS}) comparing
 *      the current time against the last recorded activity timestamp in
 *      localStorage.
 *   3. Also re-evaluates that check whenever another tab writes the activity
 *      timestamp (via the `storage` event), so activity in one tab keeps this
 *      tab alive immediately instead of waiting for the next poll — important
 *      when background-tab timer throttling delays the interval.
 *   4. Once the idle timeout is exceeded, releases any measures / CQL libraries
 *      the user has locked (via {@link performLogoutCleanup}) and then triggers
 *      `oktaAuth.signOut()`, which clears tokens, revokes them server-side, and
 *      redirects to the post-logout URI. Cleanup failures are logged but never
 *      block logout. Only the tab whose check fires first performs cleanup;
 *      other tabs observe the token removal via Okta's `syncStorage` and drop to
 *      an unauthenticated state (tearing this hook down) without repeating it.
 *
 * The DOM listeners, the `storage` listener, and the periodic interval are torn
 * down when the user logs out (auth state flips to false) or the consuming
 * component unmounts. The hook is inert while `authState.isAuthenticated` is not
 * true.
 */
export const useInactivityLogout = (): void => {
  const { authState, oktaAuth } = useOktaAuth();
  const authenticated = authState?.isAuthenticated;

  // Service instances used to release locked resources before signing out.
  // Held in refs so the effect below is not re-created when the hooks return
  // new-but-equivalent instances on each render.
  const measureServiceApiRef = useRef(useMeasureServiceApi());
  const cqlLibraryServiceApiRef = useRef(useCqlLibraryServiceApi());

  useEffect(() => {
    if (!authenticated) {
      return;
    }

    // Attach DOM activity listeners and record an initial timestamp.
    activityTracker.startTracking();

    // Guard against issuing more than one signOut while the redirect is in
    // flight (the check may fire again before navigation completes).
    let signingOut = false;

    const checkIdleAndSignOut = (): void => {
      if (signingOut || !activityTracker.isIdleTimeoutExceeded()) {
        return;
      }
      signingOut = true;
      // Release any measures/CQL libraries locked by this user before signing
      // out so other team members aren't blocked. Cleanup failures are logged
      // (inside performLogoutCleanup) but never block logout.
      Promise.resolve(
        performLogoutCleanup(
          measureServiceApiRef.current,
          cqlLibraryServiceApiRef.current
        )
      )
        .then(() => oktaAuth.signOut())
        .catch((error) => {
          // Allow a later check to retry if sign out failed.
          signingOut = false;
          console.error("[useInactivityLogout] Failed to sign out user", error);
        });
    };

    const intervalId = setInterval(checkIdleAndSignOut, IDLE_CHECK_INTERVAL_MS);

    // Cross-tab: `storage` events fire in every OTHER tab when one tab writes
    // the activity timestamp. Re-evaluating on the event lets a tab react to
    // activity elsewhere immediately, rather than waiting up to a full polling
    // interval — important when background-tab timer throttling delays the
    // interval (e.g. Edge putting idle tabs to sleep). A fresh activity write
    // is never "idle", so this only ever keeps the tab alive.
    const handleStorage = (event: StorageEvent): void => {
      if (event.key === MADiE_LAST_ACTIVITY) {
        checkIdleAndSignOut();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("storage", handleStorage);
      activityTracker.stopTracking();
    };
  }, [authenticated, oktaAuth]);
};

/**
 * InactivityLogout
 *
 * Thin wrapper component that runs {@link useInactivityLogout} and renders
 * nothing. It must be rendered **inside** the `ApiContextProvider`: the hook
 * resolves the measure / CQL library service instances (used for pre-logout
 * unlock cleanup) via `useMeasureServiceApi` / `useCqlLibraryServiceApi`, which
 * read the service config from context and throw if that context is absent.
 */
export const InactivityLogout = (): null => {
  useInactivityLogout();
  return null;
};

export default useInactivityLogout;
