import React, { useState } from "react";
import { Security } from "@okta/okta-react";
import { OktaAuth, toRelativeUrl } from "@okta/okta-auth-js";
import { getOktaConfig, OktaConfig } from "./Config";
import Router from "../router/Router";

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
  // extra requirement:  user must have valid Okta session
  authState.isAuthenticated = await oktaAuth.session.exists();
  return authState;
};

function OktaSecurity() {
  // const navigate = useNavigate();
  const [oktaConfig, setOktaConfig] = useState<OktaConfig>();
  const [oktaConfigErr, setOktaConfigErr] = useState<string>();

  const customAuthHandler = () => {
    window.location.href = "/login";
  };

  const restoreOriginalUri = async (_oktaAuth, originalUri) => {
    // To avoid completely refactoring this app:
    // previously we had two routers to have access to history.replace. router-dom6 does not like this.
    // New method is to just update the url using native function. Same with customAuthHandler.
    // This may also very likely not even be necessary at all with router-dom 6 based on how the routes are set.
    window.location.assign(
      toRelativeUrl(originalUri || "/", window.location.origin)
    );
  };

  if (!oktaConfig && !oktaConfigErr) {
    (async () => {
      await getOktaConfig()
        .then((config) => {
          setOktaConfig(config);
        })
        .catch((err) => {
          console.error(err);
          setOktaConfigErr(
            "Unable to load Login page, Please contact administration"
          );
        });
    })();
  }

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

  if (!!oktaConfig) {
    const oktaAuth = new OktaAuth({
      ...oktaConfig, // other config
      transformAuthState,
    });
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
