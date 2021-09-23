import React from "react";
import { Redirect } from "react-router-dom";
import { LoginWidget } from "@madie/madie-auth";
import { useOktaAuth } from "@okta/okta-react";

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

  if (!authState) return null;

  return authState.isAuthenticated ? (
    <Redirect to={{ pathname: "/" }} />
  ) : (
    <LoginWidget {...loginConfig} />
  );
}
export default Login;
