import React, { useLayoutEffect, useState } from "react";
import {
  Route,
  Navigate,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import { LoginCallback, useOktaAuth } from "@okta/okta-react";
import Login from "../components/login/Login";
import { MadieMeasure } from "@madie/madie-measure";
import { MadieCqlLibrary } from "@madie/madie-cql-library";
import NotFound from "../components/notfound/NotFound";
import Footer from "../components/Footer/Footer";
import "../styles/LayoutStyles.scss";
import TimeoutHandler from "../components/timeoutHandler/TimeoutHandler";
import LayoutWrapper from "./LayoutWrapper";
import MainNavBar from "../components/MainNavBar/MainNavBar";
import PageHeader from "../components/PageHeader/PageHeader";

function Router({ props }) {
  const { authState } = useOktaAuth();
  const authenticated = authState?.isAuthenticated;
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
  const BrowserRouter = createBrowserRouter(
    createRoutesFromElements(
      <Route path="">
        <Route
          path="login"
          element={
            <div className="layout-wrapper">
              <MainNavBar />
              <PageHeader />
              <div id="page-content">
                <Login config={props.oktaSignInConfig} />
              </div>
              <Footer />
            </div>
          }
        />

        <Route
          path="measures/*"
          element={
            authenticated ? (
              <LayoutWrapper children={<MadieMeasure />} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="login/callback" element={LoginCallback} />
        <Route
          path="cql-libraries/*"
          element={
            authenticated ? (
              <LayoutWrapper children={<MadieCqlLibrary />} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/404" element={NotFound} />
      </Route>
    )
  );

  return (
    <div>
      {authenticated && (
        <TimeoutHandler timeLeft={25 * 60 * 1000} warningTime={5 * 60 * 1000} />
      )}
      <RouterProvider router={BrowserRouter} key={firstLogin ? 1 : 2} />
    </div>
  );
}
export default Router;
