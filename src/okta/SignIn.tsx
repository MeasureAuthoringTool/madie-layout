import React from "react";
import { Redirect } from "react-router-dom";
import SignInForm from "./SignInForm";
import { useOktaAuth } from "@okta/okta-react";

const SignIn = () => {
  const { authState } = useOktaAuth();

  if (!authState) {
    return <div>Loading...</div>;
  }
  return authState.isAuthenticated ? (
    <Redirect to={{ pathname: "/" }} />
  ) : (
    <SignInForm />
  );
};

export default SignIn;
