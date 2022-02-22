import { IDToken } from "@okta/okta-auth-js/lib/types/Token";
import { AuthState, OktaAuth, UserClaims } from "@okta/okta-auth-js";

interface GenericToken extends IDToken {
  accessToken: string;
  claims: UserClaims;
  tokenType: string;
  userinfoUrl: string;
  expiresAt: number;
}

const oktaAuthTestProps = (isAuthenticated?: boolean) => {
  const testToken = <M extends Record<string, any>>(more: M): GenericToken => {
    const {
      claims = { sub: "test@test" },
      accessToken = "testAccess",
      tokenType = "accessToken",
      expiresAt = 999999999,
      authorizeUrl = "",
      userinfoUrl = "",
      idToken = "testIDToken",
      issuer = "https://domain.okta.com/oauth2/default",
      clientId = "testClientId",
      scopes = [],
      ...rest
    } = more;
    return {
      idToken,
      issuer,
      clientId,
      userinfoUrl,
      accessToken,
      tokenType,
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
      issuer: "https://domain.okta.com/oauth2/default",
      clientId: "testClientId",
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
      issuer: "https://domain.okta.com/oauth2/default",
      clientId: "testClientId",
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
