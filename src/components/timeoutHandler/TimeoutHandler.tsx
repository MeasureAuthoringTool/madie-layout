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
      setTimingOut(true);
      logoutTimeoutRef.current = setTimeout(async () => {
        await oktaAuth.signOut();
      }, warningTime);
    }
  };

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

  // initialize
  useLayoutEffect(() => {
    const rootNode = document.getElementById("main");
    inactivityTimeoutRef.current = setTimeout(timeoutCallBack, timeLeft);
    rootNode.addEventListener("keypress", resetTimeout);
    rootNode.addEventListener("click", resetTimeout);
    rootNode.addEventListener("mousemove", resetTimeout);
    return () => {
      rootNode.removeEventListener("keypress", resetTimeout);
      rootNode.removeEventListener("click", resetTimeout);
      rootNode.removeEventListener("mouseMove", resetTimeout);
      clearTimeout(inactivityTimeoutRef.current);
      clearTimeout(logoutTimeoutRef.current);
      inactivityTimeoutRef.current = null;
      logoutTimeoutRef.current = null;
    };
  }, [resetTimeout, logoutTimeoutRef, inactivityTimeoutRef, timeLeft]);
  return (
    <Dialog
      open={timingOut}
      onKeyDown={resetTimeout}
      onMouseMove={resetTimeout}
      onClose={resetTimeout}
      aria-labelledby="warn-timeout-title"
      aria-describedby="warn-timeout-description"
    >
      {/* we want clicks inside to also trigger reset */}
      <div role="button" tabIndex={0} onClick={resetTimeout}>
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
