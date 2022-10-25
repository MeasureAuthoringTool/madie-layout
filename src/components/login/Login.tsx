import React from "react";
import { Redirect } from "react-router-dom";
import { LoginWidget } from "@madie/madie-auth";
import { useOktaAuth } from "@okta/okta-react";
import { loginLogger } from "../../custom-hooks/customLog";
import { useDocumentTitle } from "@madie/madie-util";

function Login({ config }) {
  useDocumentTitle("MADiE Login");
  const { oktaAuth, authState } = useOktaAuth();

  const loginConfig = {
    props: {
      config: config,
      onSuccess: (tokens) => {
        oktaAuth.handleLoginRedirect(tokens);
        if (oktaAuth.token != null && oktaAuth.token.getUserInfo() != null) {
          oktaAuth.token
            .getUserInfo()
            .then((info) => {
              loginLogger(info);
            })
            .catch((error) => {});
        }
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
    <>
      <LoginWidget {...loginConfig} />
    </>
  );
}
export default Login;
