import React from "react";

export function LoginWidget({ props }) {
  const oktaTokens = { name: "test me" };
  return (
    <div
      role="button"
      tabIndex={0}
      data-testid="login-testid"
      onClick={() => props.onSuccess(oktaTokens)}
    >
      Login Widget
    </div>
  );
}
