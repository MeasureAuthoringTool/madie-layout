import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Security } from "@okta/okta-react";
import { OktaAuth, toRelativeUrl } from "@okta/okta-auth-js";
import { getOktaConfig, OktaConfig } from "./Config";
import Router from "../router/Router";

function OktaSecurity() {
  const history = useHistory();
  const [oktaConfig, setOktaConfig] = useState<OktaConfig>();
  const [oktaConfigErr, setOktaConfigErr] = useState<string>();

  const customAuthHandler = () => {
    history.push("/login");
  };

  const restoreOriginalUri = async (_oktaAuth, originalUri) => {
    history.replace(toRelativeUrl(originalUri, window.location.origin));
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

  if (!!oktaConfig) {
    const oktaAuth = new OktaAuth(oktaConfig.oktaAuthConfig);
    const routerProps = {
      props: {
        oktaSignInConfig: {
          ...oktaConfig?.oktaSignInConfig,
          authParams: {
            authClient: oktaAuth,
          },
        },
      },
    };
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
