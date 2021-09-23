import { AbstractToken } from "@okta/okta-auth-js/lib/types/Token";
import { AuthState, OktaAuth, UserClaims } from "@okta/okta-auth-js";

const oktaAuthTestProps = (isAuthenticated?: boolean) => {
  const testToken = <M extends Record<string, any>>(
    more: M
  ): AbstractToken & { claims: UserClaims } & Omit<
      M,
      keyof AbstractToken | "claims"
    > => {
    const {
      claims = { sub: "test@test.com" },
      expiresAt = 999999999,
      authorizeUrl = "",
      scopes = [],
      ...rest
    } = more;
    return {
      claims,
      expiresAt,
      authorizeUrl,
      scopes,
      ...rest,
    };
  };

  const loggedInState: (
    authState: AuthState,
    isAuthenticated: boolean
  ) => AuthState = (authState: AuthState, isAuthenticated) => ({
    ...authState,
    isAuthenticated: !!isAuthenticated,
    idToken: testToken({
      ...authState?.idToken,
      idToken: "testIDToken",
      issuer: "testIDToken",
      clientId: "testIDToken",
    }),
    accessToken: testToken({
      ...authState?.accessToken,
      accessToken: "testAccessToken",
      tokenType: "accessToken",
      userinfoUrl: "",
    }),
  });

  const oktaAuth = (isAuthenticated: boolean) =>
    new OktaAuth({
      issuer: "https://dev-234234.okta.com/oauth2/default",
      clientId: "asdfasdfasdfasdf",
      redirectUri: window.location.origin + "/login/callback",
      transformAuthState: async (ignored: any, authState: AuthState) =>
        loggedInState(authState, isAuthenticated),
    });

  return {
    oktaAuth: oktaAuth(isAuthenticated),
    restoreOriginalUri: () => {},
  };
};

export { oktaAuthTestProps };
