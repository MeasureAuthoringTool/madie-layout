import React from "react";
import { Route, Switch, useParams } from "react-router-dom";
import { SecureRoute, LoginCallback } from "@okta/okta-react";
import Home from "../components/home/Home";
import Login from "../components/login/Login";
import Editor from "../components/editor/Editor";

function Router({ props }) {
  return (
    <Switch>
      <SecureRoute path="/" exact={true} component={Home} />
      <Route
        path="/login"
        render={() => <Login config={props.oktaSignInConfig} />}
      />
      <SecureRoute path="/editor" component={Editor} />
      <Route path="/login/callback" component={LoginCallback} />
    </Switch>
  );
}
export default Router;
