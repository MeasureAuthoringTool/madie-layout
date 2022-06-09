import axios from "axios";
import {
  ServiceConfig,
  getServiceConfig,
} from "../custom-hooks/getServiceConfig";

import { useOktaTokens } from "@madie/madie-util";

export class TerminologyServiceApi {
  constructor(private getAccessToken: () => string) {}

  async checkLogin(): Promise<Boolean> {
    const baseUrl = await getServiceUrl();
    const resp = await axios
      .get(`${baseUrl}/vsac/umls-credentials/status`, {
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
          "Content-Type": "text/plain",
        },
        timeout: 15000,
      })
      .then((resp) => {
        if (resp.status === 200) {
          return true;
        }
      })
      .catch((error) => {
        throw error;
      });
    return false;
  }

  async loginUMLS(apiKey: string): Promise<String> {
    const baseUrl = await getServiceUrl();
    const resp = await axios
      .post(`${baseUrl}/vsac/umls-credentials`, null, {
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
          "Content-Type": "text/plain",
        },
        params: {
          apiKey: apiKey,
        },
        timeout: 15000,
      })
      .then((resp) => {
        if (resp.status === 200) {
          return "status: " + resp.status + " response: " + resp.data;
        }
      })
      .catch((error) => {
        throw error;
      });
    return "failure";
  }
}

export const getServiceUrl = async () => {
  const config: ServiceConfig = await getServiceConfig();
  const serviceUrl: string = config?.terminologyService?.baseUrl;

  return serviceUrl;
};

export default function useTerminologyServiceApi(): TerminologyServiceApi {
  const { getAccessToken } = useOktaTokens();
  return new TerminologyServiceApi(getAccessToken);
}
