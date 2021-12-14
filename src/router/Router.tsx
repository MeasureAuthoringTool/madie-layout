import React from "react";
import { Route, Switch, useHistory } from "react-router-dom";
import { SecureRoute, LoginCallback } from "@okta/okta-react";
import Home from "../components/home/Home";
import Login from "../components/login/Login";
import Editor from "../components/editor/Editor";
import { MadieMeasure } from "@madie/madie-measure";

function Router({ props }) {
  const history = useHistory();
  const onAuthResume = async () => {
    history.push("/login");
  };
  
  return (
    <Switch>
      <Route
        path="/login"
        render={() => <Login config={props.oktaSignInConfig} />}
      />
      <Route
        path="/login/callback"
        render={(props) => (
          <LoginCallback {...props} onAuthResume={onAuthResume} />
        )}
      />
      <SecureRoute path="/" exact={true} component={Home} />
      <SecureRoute path="/editor" component={Editor} />
      <SecureRoute path="/measure" component={MadieMeasure} />
    </Switch>
  );
}
export default Router;
