import React, { useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import { LoginWidget } from "@madie/madie-auth";
import {
  useDocumentTitle,
  OktaConfig,
  ServiceConfig,
  useServiceConfig,
  useMeasureServiceApi,
  useCqlLibraryServiceApi,
} from "@madie/madie-util";
import { useOktaAuth } from "@okta/okta-react";
import { loginLogger } from "../../custom-hooks/customLog";

function Login({ config }: { config: OktaConfig }) {
  useDocumentTitle("MADiE Login");
  const { oktaAuth, authState } = useOktaAuth();
  const serviceConfig: ServiceConfig = useServiceConfig();
  const measureServiceApiRef = useRef(useMeasureServiceApi());
  const cqlLibraryServiceApiRef = useRef(useCqlLibraryServiceApi());
  const loginUnlock = () => {
    try {
      measureServiceApiRef.current.unlockMeasures();
      cqlLibraryServiceApiRef.current.unlockLibraries();
      return true;
    } catch (error) {
      console.error("Error unlocking measures for user", error);
      return false;
    }
  };
  const loginConfig = {
    props: {
      config: config,
      onSuccess: async (tokens) => {
        oktaAuth.handleLoginRedirect(tokens);
        if (oktaAuth.token != null && oktaAuth.token.getUserInfo() != null) {
          oktaAuth.token
            .getUserInfo()
            .then((info) => () => {
              loginLogger(info, serviceConfig);
            })
            .catch((error) => {
              console.error("Error writing Login info", error);
            });
        }
      },
      onError: (err) => {
        /* Placeholder to handle error returned from login widget  */
      },
    },
  };

  if (!authState) return null;
  else if (authState.isAuthenticated && loginUnlock()) {
    return <Navigate to="/measures" />;
  } else {
    return (
      <>
        <LoginWidget {...loginConfig} />
      </>
    );
  }
}
export default Login;
