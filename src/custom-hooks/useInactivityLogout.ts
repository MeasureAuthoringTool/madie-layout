import { useEffect } from "react";
import { useOktaAuth } from "@okta/okta-react";
import {
  activityTracker,
  MADiE_LAST_ACTIVITY,
} from "../services/activityTracker";

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
 *   3. Also re-evaluates that check whenever another tab writes the activity
 *      timestamp (via the `storage` event), so activity in one tab keeps this
 *      tab alive immediately instead of waiting for the next poll — important
 *      when background-tab timer throttling delays the interval.
 *   4. Triggers `oktaAuth.signOut()` once the idle timeout is exceeded, which
 *      clears tokens, revokes them server-side, and redirects to the
 *      post-logout URI.
 *
 * The DOM listeners, the `storage` listener, and the periodic interval are torn
 * down when the user logs out (auth state flips to false) or the consuming
 * component unmounts. The hook is inert while `authState.isAuthenticated` is not
 * true.
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
    // flight (the check may fire again before navigation completes).
    let signingOut = false;

    const checkIdleAndSignOut = (): void => {
      if (signingOut || !activityTracker.isIdleTimeoutExceeded()) {
        return;
      }
      signingOut = true;
      Promise.resolve(oktaAuth.signOut()).catch((error) => {
        // Allow a later check to retry if sign out failed.
        signingOut = false;
        console.error("[useInactivityLogout] Failed to sign out user", error);
      });
    };

    const intervalId = setInterval(checkIdleAndSignOut, IDLE_CHECK_INTERVAL_MS);

    // Cross-tab: `storage` events fire in every OTHER tab when one tab writes
    // the activity timestamp. Re-evaluating on the event lets a tab react to
    // activity elsewhere immediately, rather than waiting up to a full polling
    // interval — important when background-tab timer throttling delays the
    // interval (e.g. Edge putting idle tabs to sleep). A fresh activity write
    // is never "idle", so this only ever keeps the tab alive.
    const handleStorage = (event: StorageEvent): void => {
      if (event.key === MADiE_LAST_ACTIVITY) {
        checkIdleAndSignOut();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("storage", handleStorage);
      activityTracker.stopTracking();
    };
  }, [authenticated, oktaAuth]);
};

export default useInactivityLogout;
