import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { SecureRoute, LoginCallback } from "@okta/okta-react";
import Login from "../components/login/Login";
import MainNavBar from "../components/MainNavBar/MainNavBar";
import { MadieMeasure } from "@madie/madie-measure";
import { MadieCqlLibrary } from "@madie/madie-cql-library";
import NotFound from "../components/notfound/NotFound";
import Footer from "../components/Footer/Footer";
import "../styles/LayoutStyles.scss";

function Router({ props }) {
  return (
    <div className="layout-wrapper">
      <MainNavBar />
      <Switch>
        <Route
          path="/login"
          render={() => <Login config={props.oktaSignInConfig} />}
        />
        <Route path="/login/callback" component={LoginCallback} />
        <SecureRoute path="/measures" component={MadieMeasure} />
        <SecureRoute path="/cql-libraries" component={MadieCqlLibrary} />
        <SecureRoute path="/" exact={true}>
          <Redirect to="/measures" />
        </SecureRoute>
        <Route path="/404" component={NotFound} />
        <Redirect to="/404" />
      </Switch>
      <Footer />
    </div>
  );
}
export default Router;
