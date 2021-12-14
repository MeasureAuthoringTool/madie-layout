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
    await axios.get<OktaEnvConfig>("/env-config/oktaConfig.json")
  ).data;

  if (!oktaEnvConfig.oktaBaseUrl && !oktaEnvConfig.clientId) {
    throw new Error("Invalid oktaEnvConfig variables");
  }

  return {
    oktaAuthConfig: {
      issuer: `https://dev.idp.idm.cms.gov`,
      clientId: `0oaaozdfrhUJZPTNk297`,
      redirectUri: window.location.origin + "/login/callback",
    },
    oktaSignInConfig: {
      baseUrl: `https://dev.idp.idm.cms.gov`,
      clientId: `0oaaozdfrhUJZPTNk297`,
      redirectUri: window.location.origin + "/login/callback",
      authParams: {},
    },
  };
}
