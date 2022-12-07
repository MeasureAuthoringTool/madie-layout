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
    We intend to listen to a browser event emitted by the measuresLanding page only on render cycle completion
  */
  const [firstLogin, setFirstLogin] = useState<boolean>(true);
  useLayoutEffect(() => {
    const mountListener = () => {
      setFirstLogin(false);
    };
    window.addEventListener("measures-mount", mountListener, false);
    return () => {
      window.removeEventListener("measures-mount", mountListener, false);
    };
  }, []);
  return (
    <div className="layout-wrapper">
      {authState?.isAuthenticated && (
        <TimeoutHandler timeLeft={25 * 60 * 1000} warningTime={5 * 60 * 1000} />
      )}
      {/* browser router prop forceRefresh does not update as expected. Modifying react key is a hack */}
      <BrowserRouter key={firstLogin ? 1 : 2} forceRefresh={firstLogin}>
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
