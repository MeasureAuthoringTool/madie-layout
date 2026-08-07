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
import { setTimeoutReturnUrl } from "../services/timeoutReturnUrl";

const LOGIN_PATHS = ["/login", "/login/callback"];

/**
 * Landing/default paths that must never be stored as a return URL. "/" (and
 * its redirect target "/measures") is where the browser lands right after an
 * inactivity sign-out — storing it here would overwrite the page the user was
 * actually on, which useInactivityLogout saved moments earlier.
 * Skipping them loses nothing for deep links either: the post-login fallback
 * is /measures anyway.
 */
const NON_STORABLE_PATHS = ["/", "/measures", "/404"];

/**
 * Redirects unauthenticated users to the login page and remembers where they
 * were trying to go. Two jobs in one place:
 *
 * 1. Deep links (MAT-10043): when a logged-out user opens a direct MADiE URL,
 *    the full path (incl. query + hash) is stored in the MAT-7718 return-URL
 *    field so `restoreOriginalUri` sends them back there after login.
 * 2. Session persistence (MAT-10040): when auth is lost mid-session (sign-out
 *    in this tab, token removal synced from another tab, failed renewal),
 *    navigate to the login screen.
 *
 * the route tree it lives in is memoized, so a plain `{authenticated === false && ...}`
 * expression would capture a stale value; this component subscribes to auth state itself
 * via useOktaAuth. It checks `=== false` (not falsy) because authState is `null` while Okta is
 * still initializing — redirecting then would bounce every page load through /login.
 */
const AuthRedirect = (): React.ReactElement | null => {
  const { authState } = useOktaAuth();
  if (authState?.isAuthenticated !== false) {
    return null;
  }
  const { pathname, search, hash } = window.location;
  if (LOGIN_PATHS.includes(pathname)) {
    return null;
  }
  if (!NON_STORABLE_PATHS.includes(pathname)) {
    setTimeoutReturnUrl(`${pathname}${search}${hash}`);
  }
  return <Navigate to="login" replace />;
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

  // re-renders on every auth-state update (token renewal, cross-tab storage sync,
  // login/logout). Building a brand-new router object each time made RouterProvider
  // remount the entire route tree, tearing down and re-mounting every micro-frontend
  // mid-use. The routes only truly depend on the sign-in config, so the router is built
  // once per config; auth reactivity lives in <AuthRedirect/> instead.
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
