import axios from "axios";

export interface OktaConfig {
  oktaAuthConfig: {
    issuer: string;
    clientId: string;
    redirectUri: string;
  };
  oktaSignInConfig: {
    baseUrl: string;
    clientId: string;
    redirectUri: string;
    authParams?: object;
  };
}

interface OktaEnvConfig {
  oktaBaseUrl: string;
  clientId: string;
}

export async function getOktaConfig(): Promise<OktaConfig> {
  const oktaEnvConfig: OktaEnvConfig = (
    await axios.get<OktaEnvConfig>("importmap/oktaConfig.json")
  ).data;

  if (!oktaEnvConfig.oktaBaseUrl && !oktaEnvConfig.clientId) {
    throw new Error("Invalid oktaEnvConfig variables");
  }

  return {
    oktaAuthConfig: {
      issuer: `${oktaEnvConfig.oktaBaseUrl}/oauth2/default`,
      clientId: `${oktaEnvConfig.clientId}`,
      redirectUri: window.location.origin + "/login/callback",
    },
    oktaSignInConfig: {
      baseUrl: `${oktaEnvConfig.oktaBaseUrl}`,
      clientId: `${oktaEnvConfig.clientId}`,
      redirectUri: window.location.origin + "/login/callback",
      authParams: {},
    },
  };
}
