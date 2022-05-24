import React, { useState, useCallback, useRef, useLayoutEffect } from "react";
import { throttle } from "lodash";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import axios from "axios";
import queryString from "query-string";
import { getOktaConfig, OktaConfig } from "../../okta/Config";
import useOktaTokens from "../../custom-hooks/useOktaTokens";

export interface timeoutPropTypes {
  timeLeft: number;
}

const revoke = async (token: string): Promise<void> => {
  const oktaConfig: OktaConfig = await getOktaConfig();
  try {
    await axios.post(
      `${oktaConfig.issuer}/v1/revoke`,
      queryString.stringify({
        token_type_hint: "access_token",
        token,
        client_id: `${oktaConfig.clientId}`,
      })
    );
  } catch (err) {
    const message = `Unable to revoke token.`;
    console.error(message);
    console.error(err);
    throw new Error(err);
  }
};

const TimeoutHandler = ({ timeLeft = 10000 }) => {
  const inactivityTimeoutRef = useRef<any>(null);
  const logoutTimeoutRef = useRef<any>(null);
  const [timingOut, setTimingOut] = useState<boolean>(false);
  const [oktaConfig, setOktaConfig] = useState<OktaConfig>();
  const [oktaConfigErr, setOktaConfigErr] = useState<string>();
  const oktaTokens = useOktaTokens();

  if (!oktaConfig && !oktaConfigErr) {
    (async () => {
      await getOktaConfig()
        .then((config) => {
          setOktaConfig(config);
        })
        .catch((err) => {
          console.error(err);
          setOktaConfigErr(
            "Unable to load Login page, Please contact administration"
          );
        });
    })();
  }

  async function logout() {
    const logoutUrl = `${window.location.origin}`;
    const oktaConfig: OktaConfig = await getOktaConfig();
    const accessToken = oktaTokens.getAccessToken();
    const idToken = oktaTokens.getIdToken();
    oktaTokens.removeTokens();
    await revoke(accessToken);

    window.location.replace(
      `${oktaConfig.issuer}/v1/logout?id_token_hint=${idToken}&post_logout_redirect_uri=${logoutUrl}`
    );
  }

  const timeoutCallBack = () => {
    setTimingOut(true);
    logoutTimeoutRef.current = setTimeout(async () => {
      logout();
    }, 2 * 1000);
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
    };
  }, [resetTimeout, inactivityTimeoutRef, timeLeft]);
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
