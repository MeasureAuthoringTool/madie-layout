import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import { LoginWidget } from "@madie/madie-auth";
import { useOktaAuth } from "@okta/okta-react";
import MainNavBar from "../MainNavBar/MainNavBar";
//MAT-3804
import { customLog } from "../../custom-hooks/customLog";

function Login({ config }) {
  const { oktaAuth, authState } = useOktaAuth();

  const loginConfig = {
    props: {
      config: config,
      onSuccess: (tokens) => {
        oktaAuth.handleLoginRedirect(tokens);
      },
      onError: (err) => {
        /* Placeholder to handle error returned from login widget  */
      },
    },
  };

  if (oktaAuth.token != null && oktaAuth.token.getUserInfo() != null) {
    oktaAuth.token
      .getUserInfo()
      .then((info) => {
        customLog(info, "info", "http://localhost:8081/api/log/login");
      })
      .catch((error) => {
        //console.log(error);
      });
  }

  if (!authState) return null;

  return authState.isAuthenticated ? (
    <div>
      <Redirect to={{ pathname: "/" }} />
    </div>
  ) : (
    <>
      <LoginWidget {...loginConfig} />
    </>
  );
}
export default Login;
