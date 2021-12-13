import React, { useState } from "react";
import { Route, useHistory } from "react-router-dom";
import { Security, SecureRoute, LoginCallback } from "@okta/okta-react";
import { OktaAuth, toRelativeUrl } from "@okta/okta-auth-js";
import Home from "./Home";
import SignIn from "./SignIn";
import Protected from "./Protected";
import { getOktaConfig, OktaConfig } from "./Config";

const AppWithRouterAccess = () => {
  const history = useHistory();
  const [oktaConfig, setOktaConfig] = useState<OktaConfig>();
  const [oktaConfigErr, setOktaConfigErr] = useState<string>();
  const onAuthRequired = () => {
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
    return (
      <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
        <Route path="/" exact={true} component={Home} />
        <SecureRoute path="/protected" component={Protected} />
        <Route path="/login" render={() => <SignIn />} />
        <Route path="/login/callback" component={LoginCallback} />
      </Security>
    );
  } else {
    return (
      <div data-testid="login-page-message">
        {oktaConfigErr ? oktaConfigErr : "Loading..."}
      </div>
    );
  }
};
export default AppWithRouterAccess;
