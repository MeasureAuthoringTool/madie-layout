import React, { useLayoutEffect, useState } from "react";
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
import RouteChangeHandler from "./RouteChangeHandler";

function Router({ props }) {
  const { authState } = useOktaAuth();
  /*
    On initial page load we want to trigger a hard refresh because single spa loads the apps sequentially based on what contains what
    This init pattern pattern influences tab order so we need to refresh on first login.
  */
  const [firstLogin, setFirstLogin] = useState<boolean>(true);
  useLayoutEffect(() => {
    if (firstLogin) {
      setFirstLogin(false);
    }
  }, [setFirstLogin]);
  return (
    <div className="layout-wrapper">
      {authState?.isAuthenticated && (
        <TimeoutHandler timeLeft={25 * 60 * 1000} warningTime={5 * 60 * 1000} />
      )}
      <BrowserRouter forceRefresh={firstLogin}>
        <MainNavBar />
        <PageHeader />
        <RouteChangeHandler />
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
