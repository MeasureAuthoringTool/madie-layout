import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect,
} from "react";
import { throttle } from "lodash";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import { useOktaAuth } from "@okta/okta-react";

export interface timeoutPropTypes {
  timeLeft: number;
}

const TimeoutHandler = ({ timeLeft = 10000, warningTime = 5000 }) => {
  // check if component is mounted before memory leak
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const inactivityTimeoutRef = useRef<any>(null);
  const logoutTimeoutRef = useRef<any>(null);
  const [timingOut, setTimingOut] = useState<boolean>(false);
  const { oktaAuth } = useOktaAuth();
  const timeoutCallBack = () => {
    if (mounted.current) {
      if (localStorage.getItem("madieDebug") || (window as any).madieDebug) {
        // eslint-disable-next-line no-console
        console.log(
          "User has been inactive for the specified period. Showing inactivity warning dialog."
        );
      }
      setTimingOut(true);
      logoutTimeoutRef.current = setTimeout(async () => {
        if (localStorage.getItem("madieDebug") || (window as any).madieDebug) {
          // eslint-disable-next-line no-console
          console.log(
            "User has timed out due to inactivity. Initiating logout."
          );
        }
        await oktaAuth.signOut();
      }, warningTime);
    } else if (
      localStorage.getItem("madieDebug") ||
      (window as any).madieDebug
    ) {
      // eslint-disable-next-line no-console
      console.log(
        "Timeout warning not displayed as component was not mounted!"
      );
    }
  };

  const refreshTokens = useCallback(
    throttle(
      () => {
        oktaAuth.tokenManager.renew("idToken").finally();
        oktaAuth.tokenManager.renew("accessToken").finally();
      },
      240000,
      { leading: true, trailing: true }
    ),
    []
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const resetTimeout = useCallback(
    throttle(
      () => {
        setTimingOut(false);
        clearTimeout(inactivityTimeoutRef.current);
        inactivityTimeoutRef.current = setTimeout(timeoutCallBack, timeLeft);
        if (logoutTimeoutRef.current) {
          clearTimeout(logoutTimeoutRef.current);
        }
      },
      500,
      { leading: true }
    ),
    [timeLeft]
  );

  const handleUserActivity = useCallback(() => {
    resetTimeout();
    refreshTokens();
  }, []);

  // initialize
  useLayoutEffect(() => {
    const rootNode = document.getElementById("main");
    inactivityTimeoutRef.current = setTimeout(timeoutCallBack, timeLeft);
    rootNode.addEventListener("keypress", handleUserActivity);
    rootNode.addEventListener("click", handleUserActivity);
    rootNode.addEventListener("mousemove", handleUserActivity);
    return () => {
      rootNode.removeEventListener("keypress", handleUserActivity);
      rootNode.removeEventListener("click", handleUserActivity);
      rootNode.removeEventListener("mouseMove", handleUserActivity);
      clearTimeout(inactivityTimeoutRef.current);
      clearTimeout(logoutTimeoutRef.current);
      inactivityTimeoutRef.current = null;
      logoutTimeoutRef.current = null;
    };
  }, [handleUserActivity, logoutTimeoutRef, inactivityTimeoutRef, timeLeft]);
  return (
    <Dialog
      open={timingOut}
      onKeyDown={handleUserActivity}
      onMouseMove={handleUserActivity}
      onClose={handleUserActivity}
      aria-labelledby="warn-timeout-title"
      aria-describedby="warn-timeout-description"
    >
      {/* we want clicks inside to also trigger reset */}
      <div role="button" tabIndex={0} onClick={handleUserActivity}>
        <DialogTitle id="warn-timeout-title">
          Session Expiration Warning
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="warn-timeout-description">
            Your session is about to expire due to an extended period of
            inactivity.
          </DialogContentText>
        </DialogContent>
      </div>
    </Dialog>
  );
};

export default TimeoutHandler;
