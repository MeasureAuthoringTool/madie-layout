import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { SecureRoute, LoginCallback } from "@okta/okta-react";
import Home from "../components/home/Home";
import Login from "../components/login/Login";
import NotFound from "../components/notfound/NotFound";

function Router({ props }) {
  return (
    <Switch>
      <Route
        path="/login"
        render={() => <Login config={props.oktaSignInConfig} />}
      />
      <Route path="/login/callback" component={LoginCallback} />
      <SecureRoute path="/measures" component={Home} />
      <SecureRoute path="/" exact={true}>
        <Redirect to="/measures" />
      </SecureRoute>
      <Route path="/404" component={NotFound} />
      <Redirect to="/404" />
    </Switch>
  );
}
export default Router;
