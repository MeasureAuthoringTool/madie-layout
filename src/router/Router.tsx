import React from "react";
import { Route, Switch } from "react-router-dom";
import { SecureRoute, LoginCallback } from "@okta/okta-react";
import Home from "../components/home/Home";
import Login from "../components/login/Login";
import Editor from "../components/editor/Editor";
import Measure from "../components/measure/Measure";
import { NewMeasure, EditMeasure } from "@madie/madie-measure";

function Router({ props }) {
  return (
    <Switch>
      <SecureRoute path="/" exact={true} component={Home} />
      <Route
        path="/login"
        render={() => <Login config={props.oktaSignInConfig} />}
      />

      <Route path="/measure/:id/edit" component={EditMeasure} />
      <SecureRoute path="/editor" component={Editor} />
      <SecureRoute path="/measure" component={Measure} />
      <SecureRoute path="/create-measure" component={NewMeasure} />

      <Route path="/login/callback" component={LoginCallback} />
    </Switch>
  );
}
export default Router;
