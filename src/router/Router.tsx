import React from "react";
import { Redirect, BrowserRouter, Route, Switch } from "react-router-dom";
import { SecureRoute, LoginCallback, useOktaAuth } from "@okta/okta-react";
import Login from "../components/login/Login";
import MainNavBar from "../components/MainNavBar/MainNavBar";
import { MadieMeasure } from "@madie/madie-measure";
import { MadieCqlLibrary } from "@madie/madie-cql-library";
import NotFound from "../components/notfound/NotFound";
import Footer from "../components/Footer/Footer";
import PageHeader from "../components/PageHeader/PageHeader";
import "../styles/LayoutStyles.scss";
import TimeoutHandler from "../components/timeoutHandler/TimeoutHandler";

function Router({ props }) {
  const { authState, oktaAuth } = useOktaAuth();
  return (
    <div className="layout-wrapper">
      {authState?.isAuthenticated && <TimeoutHandler timeLeft={2 * 1000} />}
      <BrowserRouter>
        <MainNavBar />
        <PageHeader />
        <div id="page-content">
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
        </div>
      </BrowserRouter>
      <Footer />
    </div>
  );
}
export default Router;
