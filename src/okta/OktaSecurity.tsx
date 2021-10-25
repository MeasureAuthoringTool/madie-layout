import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Security } from "@okta/okta-react";
import { OktaAuth, toRelativeUrl } from "@okta/okta-auth-js";
import { getOktaConfig, OktaConfig } from "./Config";
import Router from "../router/Router";

function OktaSecurity() {
  const history = useHistory();
  const [oktaConfig, setOktaConfig] = useState<OktaConfig>();

  const customAuthHandler = () => {
    history.push("/login");
  };

  const restoreOriginalUri = async (_oktaAuth, originalUri) => {
    history.replace(toRelativeUrl(originalUri, window.location.origin));
  };

  if (!oktaConfig) {
    (async () => {
      await getOktaConfig()
        .then((config) => {
          setOktaConfig(config);
        })
        .catch((err) => {
          return err;
        });
    })();
  }

  const routerProps = {
    props: {
      oktaSignInConfig: oktaConfig?.oktaSignInConfig,
    },
  };

  if (!!oktaConfig) {
    const oktaAuth = new OktaAuth(oktaConfig.oktaAuthConfig);
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
      <div data-testid="undefined-OktaConfig">Unable to fetch oktaConfig</div>
    );
  }
}
export default OktaSecurity;
