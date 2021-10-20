import React, { Dispatch, useEffect, useState} from "react";
import { useHistory } from "react-router-dom";
import { Security } from "@okta/okta-react";
import { OktaAuth, toRelativeUrl } from "@okta/okta-auth-js";
import getOktaConfig from "./Config";
import Router from "../router/Router";

function OktaSecurity() {
  const history = useHistory();
  const [oktaConfig, setOktaConfig]: [any, Dispatch<any>] = useState();

  const customAuthHandler = () => {
    history.push("/login");
  };

  const restoreOriginalUri = async (_oktaAuth, originalUri) => {
    history.replace(toRelativeUrl(originalUri, window.location.origin));
  };

  useEffect(() => {
    (async () => {
      setOktaConfig(await getOktaConfig());
    })();
  }, []);

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
        <Router {...routerProps}></Router>
      </Security>
    );
  } else {
    return <div>Loading...</div>;
  }
}
export default OktaSecurity;
