import { wafIntercept } from "@madie/madie-util";
import axios from "axios";

export interface OktaConfig {
  baseUrl: string;
  issuer: string;
  clientId: string;
  redirectUri: string;
}

interface OktaEnvConfig {
  baseUrl: string;
  issuerUrl: string;
  clientId: string;
}

axios.interceptors.response.use((response) => {
  return response;
}, wafIntercept);

export async function getOktaConfig(): Promise<OktaConfig> {
  const oktaEnvConfig: OktaEnvConfig = (
    await axios.get<OktaEnvConfig>("/env-config/oktaConfig.json")
  ).data;

  if (
    !oktaEnvConfig.baseUrl ||
    !oktaEnvConfig.issuerUrl ||
    !oktaEnvConfig.clientId
  ) {
    throw new Error("Invalid oktaEnvConfig variables");
  }

  return {
    baseUrl: `${oktaEnvConfig.baseUrl}`,
    issuer: `${oktaEnvConfig.issuerUrl}`,
    clientId: `${oktaEnvConfig.clientId}`,
    redirectUri: window.location.origin + "/login/callback",
  };
}
