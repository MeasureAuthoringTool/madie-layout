import axios from "axios";

export interface OktaConfig {
  baseUrl: string;
  clientId: string;
  redirectUri: string;
  authParams: {
    issuer: string;
    clientId: string;
    redirectUri: string;
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
    baseUrl: `https://dev.idp.idm.cms.gov`,
    clientId: "0oaaozdfrhUJZPTNk297",
    redirectUri: window.location.origin + "/login/callback",
    authParams: {
      issuer: "https://dev.idp.idm.cms.gov/oauth2/ausb10u24pv908noS297",
      clientId: "0oaaozdfrhUJZPTNk297",
      redirectUri: window.location.origin + "/login/callback",
    },
  };
}
