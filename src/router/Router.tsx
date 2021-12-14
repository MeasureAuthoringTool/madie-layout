import React from "react";
import { Route, Switch } from "react-router-dom";
import { SecureRoute, LoginCallback } from "@okta/okta-react";
import Home from "../components/home/Home";
import Login from "../components/login/Login";
import Editor from "../components/editor/Editor";
import { MadieMeasure } from "@madie/madie-measure";

function Router({ props }) {
  return (
    <Switch>
      <Route
        path="/login"
        render={() => <Login config={props.oktaSignInConfig} />}
      />
      <Route path="/login/callback" component={LoginCallback} />
      <SecureRoute path="/" exact={true} component={Home} />
      <SecureRoute path="/editor" component={Editor} />
      <SecureRoute path="/measure" component={MadieMeasure} />
    </Switch>
  );
}
export default Router;
