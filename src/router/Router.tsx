import React, { useLayoutEffect, useState } from "react";
import {
  Route,
  Navigate,
  Outlet,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import { LoginCallback, useOktaAuth } from "@okta/okta-react";
import Login from "../components/login/Login";
import { MadieMeasure } from "@madie/madie-measure";
import { MadieCqlLibrary } from "@madie/madie-cql-library";
import NotFound from "../components/notfound/NotFound";
import "../styles/LayoutStyles.scss";
import TimeoutHandler from "../components/timeoutHandler/TimeoutHandler";
import LayoutWrapper from "./LayoutWrapper";

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
      <Route
        path=""
        element={
          <LayoutWrapper>
            <Outlet />
            {authenticated === false && <Navigate to="login" />}
          </LayoutWrapper>
        }
      >
        <Route path="login/callback" element={LoginCallback} />
        <Route path="measures/*" element={<MadieMeasure />} />
        <Route path="cql-libraries/*" element={<MadieCqlLibrary />} />
        <Route
          path="login"
          element={<Login config={props.oktaSignInConfig} />}
        />
        <Route path="404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
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
