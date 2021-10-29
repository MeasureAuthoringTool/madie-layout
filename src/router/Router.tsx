import React from "react";
import { Route, Switch } from "react-router-dom";
import { SecureRoute, LoginCallback } from "@okta/okta-react";
import Home from "../components/home/Home";
import { oktaSignInConfig } from "../okta/Config";
import Login from "../components/login/Login";
import Editor from "../components/editor/Editor";
import Landing from "../components/landing/Landing";

function Router() {
  return (
    <Switch>
      <SecureRoute path="/" exact={true} component={Home} />
      <SecureRoute path="/measures">
        <Landing
          text="To get started please Create a Measure."
          hasButton
          buttonText="Create Measure"
        />
      </SecureRoute>
      <Route path="/login" render={() => <Login config={oktaSignInConfig} />} />
      <SecureRoute path="/editor" component={Editor} />
      <Route path="/login/callback" component={LoginCallback} />
    </Switch>
  );
}
export default Router;
