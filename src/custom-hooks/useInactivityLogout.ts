import { useEffect } from "react";
import { useOktaAuth } from "@okta/okta-react";
import { activityTracker } from "../services/activityTracker";

/**
 * Interval (ms) at which the hook checks whether the idle timeout has been
 * exceeded.
 */
export const IDLE_CHECK_INTERVAL_MS = 30_000; // 30 seconds

/**
 * useInactivityLogout
 *
 * Automatically signs the user out after a period of inactivity.
 *
 * While the user is authenticated, this hook:
 *   1. Starts activity tracking (attaches the DOM event listeners defined by
 *      `activityTracker` — mousemove, mousedown, keydown, scroll, touchstart,
 *      click — and records an initial activity timestamp).
 *   2. Runs a periodic check (every {@link IDLE_CHECK_INTERVAL_MS}) comparing
 *      the current time against the last recorded activity timestamp in
 *      localStorage.
 *   3. Triggers `oktaAuth.signOut()` once the idle timeout is exceeded, which
 *      clears tokens, revokes them server-side, and redirects to the
 *      post-logout URI.
 *
 * The DOM listeners and the periodic interval are torn down when the user logs
 * out (auth state flips to false) or the consuming component unmounts. The hook
 * is inert while `authState.isAuthenticated` is not true.
 */
export const useInactivityLogout = (): void => {
  const { authState, oktaAuth } = useOktaAuth();
  const authenticated = authState?.isAuthenticated;

  useEffect(() => {
    if (!authenticated) {
      return;
    }

    // Attach DOM activity listeners and record an initial timestamp.
    activityTracker.startTracking();

    // Guard against issuing more than one signOut while the redirect is in
    // flight (the interval may fire again before navigation completes).
    let signingOut = false;

    const intervalId = setInterval(() => {
      if (signingOut || !activityTracker.isIdleTimeoutExceeded()) {
        return;
      }
      signingOut = true;
      Promise.resolve(oktaAuth.signOut()).catch((error) => {
        // Allow a later interval tick to retry if sign out failed.
        signingOut = false;
        console.error("[useInactivityLogout] Failed to sign out user", error);
      });
    }, IDLE_CHECK_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
      activityTracker.stopTracking();
    };
  }, [authenticated, oktaAuth]);
};

export default useInactivityLogout;
