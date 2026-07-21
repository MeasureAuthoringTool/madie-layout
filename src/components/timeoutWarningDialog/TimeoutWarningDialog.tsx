import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import {
  activityTracker,
  MADiE_LAST_ACTIVITY,
} from "../../services/activityTracker";

/**
 * Show the warning once the remaining idle time drops to this threshold or
 * below (5 minutes before automatic logout).
 */
export const WARNING_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

/**
 * How often the remaining idle time is re-evaluated while mounted. A short
 * cadence keeps the warning appearing promptly at the 5-minute mark and lets it
 * disappear quickly once activity resets the countdown.
 */
export const WARNING_POLL_INTERVAL_MS = 1_000; // 1 second

/**
 * TimeoutWarningDialog
 *
 * Renders a MUI `Dialog` warning the user that their session is about to expire
 * once {@link WARNING_THRESHOLD_MS} or less remains before the idle-timeout
 * logout (driven by `useInactivityLogout` + `activityTracker`).
 *
 * Interacting with the warning (click, keypress, mouse move) force-updates the
 * activity timestamp — bypassing the tracker's throttle — which restarts the
 * idle countdown and dismisses the warning. If the user never interacts, the
 * countdown continues and `useInactivityLogout` signs them out.
 *
 * This component replaces the previous timer-based `TimeoutHandler`; the
 * pre-logout unlock cleanup that lived there now runs in `useInactivityLogout`
 * (see `performLogoutCleanup`). It should only be rendered while the user is
 * authenticated.
 */
const TimeoutWarningDialog = (): React.ReactElement => {
  const [open, setOpen] = useState<boolean>(false);

  const evaluateRemaining = useCallback(() => {
    // Warn when the countdown reaches the threshold and stay visible through 0;
    // the actual sign-out (and unmount) is handled by useInactivityLogout.
    setOpen(activityTracker.getRemainingIdleMs() <= WARNING_THRESHOLD_MS);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(evaluateRemaining, WARNING_POLL_INTERVAL_MS);

    // Cross-tab: activity in another tab writes the activity timestamp, firing a
    // `storage` event here. Re-evaluate so a still-active user's warning clears
    // immediately instead of waiting for the next poll.
    const handleStorage = (event: StorageEvent): void => {
      if (event.key === MADiE_LAST_ACTIVITY) {
        evaluateRemaining();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("storage", handleStorage);
    };
  }, [evaluateRemaining]);

  const handleUserActivity = useCallback(() => {
    // Force-update the activity timestamp (bypassing the 15s throttle) so the
    // idle countdown restarts, then dismiss the warning immediately.
    activityTracker.forceRecordActivity();
    setOpen(false);
  }, []);

  return (
    <Dialog
      open={open}
      onKeyDown={handleUserActivity}
      onMouseMove={handleUserActivity}
      onClose={handleUserActivity}
      aria-labelledby="warn-timeout-title"
      aria-describedby="warn-timeout-description"
    >
      {/* clicks anywhere inside the dialog also count as interaction */}
      <div role="button" tabIndex={0} onClick={handleUserActivity}>
        <DialogTitle id="warn-timeout-title">
          Session Expiration Warning
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="warn-timeout-description">
            Your session is about to expire due to an extended period of
            inactivity. Interact with this screen to continue your session.
          </DialogContentText>
        </DialogContent>
      </div>
    </Dialog>
  );
};

export default TimeoutWarningDialog;
