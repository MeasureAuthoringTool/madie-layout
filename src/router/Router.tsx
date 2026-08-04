import React, { useLayoutEffect, useEffect, useMemo, useState } from "react";
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
import TimeoutWarningDialog from "../components/timeoutWarningDialog/TimeoutWarningDialog";
import LayoutWrapper from "./LayoutWrapper";
import { ApiContextProvider, getServiceConfig } from "@madie/madie-util";
import { InactivityLogout } from "../custom-hooks/useInactivityLogout";

/**
 * Redirects to the login page once auth is definitively lost. Rendered inside
 * the (memoized) route tree and reads auth state itself, so redirecting stays
 * reactive without re-creating the router object on every auth-state change.
 */
const AuthRedirect = (): React.ReactElement | null => {
  const { authState } = useOktaAuth();
  return authState?.isAuthenticated === false ? <Navigate to="login" /> : null;
};

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

  // Memoized: re-creating the router object on every render (each auth-state
  // update, token renewal, or cross-tab storage sync re-renders this
  // component) remounts the entire route tree — tearing down and re-mounting
  // every micro-frontend mid-use.
  const BrowserRouter = useMemo(
    () =>
      createBrowserRouter(
        createRoutesFromElements(
          <Route
            path=""
            element={
              <LayoutWrapper>
                <Outlet />
                <AuthRedirect />
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
      ),
    [props.oktaSignInConfig]
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
        {/* Both rendered inside the provider (so the service hooks used for
            pre-logout unlock cleanup can read the service config) and gated on
            `authenticated` so no idle tracking / timers run while logged out.
            The hook also guards internally, so this gating is defense-in-depth. */}
        {authenticated && <InactivityLogout />}
        {authenticated && <TimeoutWarningDialog />}
        <RouterProvider router={BrowserRouter} key={firstLogin ? 1 : 2} />
      </ApiContextProvider>
    </div>
  );
}
export default Router;
