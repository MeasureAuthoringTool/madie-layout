import React, { useLayoutEffect, useEffect, useState } from "react";
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
import { MadieAdmin } from "@madie/madie-admin";
import NotFound from "../components/notfound/NotFound";
import "../styles/LayoutStyles.scss";
import TimeoutHandler from "../components/timeoutHandler/TimeoutHandler";
import LayoutWrapper from "./LayoutWrapper";
import { ApiContextProvider, getServiceConfig } from "@madie/madie-util";
import { activityTracker } from "../services/activityTracker";

function Router({ props }) {
  const { authState } = useOktaAuth();
  const authenticated = authState?.isAuthenticated;
  const [serviceConfig, setServiceConfig] = useState(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getServiceConfig()
      .then((config) => setServiceConfig(config))
      .catch((err) => setError(err.message));
  }, []);

  // Start activity tracking when user is authenticated.
  // This attaches DOM listeners (mousemove, mousedown, keydown, scroll, touchstart, click)
  // and writes the last activity timestamp to localStorage for cross-microfrontend sharing.
  useEffect(() => {
    if (authenticated) {
      activityTracker.startTracking();
    } else {
      activityTracker.stopTracking();
    }
    return () => {
      activityTracker.stopTracking();
    };
  }, [authenticated]);
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
        <Route path="/" element={<Navigate to="/measures" />} />
        <Route path="login/callback" element={LoginCallback} />
        <Route path="measures/*" element={<MadieMeasure />} />
        <Route path="cql-libraries/*" element={<MadieCqlLibrary />} />
        <Route path="admin/*" element={<MadieAdmin />} />
        <Route
          path="login"
          element={<Login config={props.oktaSignInConfig} />}
        />
        <Route path="404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    )
  );

  if (error) {
    return <div>Error loading service config: {error}</div>;
  }
  if (!serviceConfig) {
    return <div>Loading service config...</div>;
  }

  return (
    <div>
      <ApiContextProvider value={serviceConfig}>
        {authenticated && (
          <TimeoutHandler
            timeLeft={25 * 60 * 1000}
            warningTime={5 * 60 * 1000}
          />
        )}
        <RouterProvider router={BrowserRouter} key={firstLogin ? 1 : 2} />
      </ApiContextProvider>
    </div>
  );
}
export default Router;
