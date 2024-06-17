import axios, { AxiosResponse } from "axios";
import { ServiceConfig, getServiceConfig } from "./getServiceConfig";
import { wafIntercept } from "@madie/madie-util";

export default async function customLog(
  input: any,
  action: string
): Promise<AxiosResponse<any, any>> {
  if (
    input !== null &&
    input !== undefined &&
    Object.keys(input).length !== 0
  ) {
    const serviceUrl = await getServiceUrl();

    return axios.post(`${serviceUrl}/log/${action}`, input);
  }
}

export const getServiceUrl = async () => {
  const config: ServiceConfig = await getServiceConfig();
  const serviceUrl: string = config?.loggingService?.baseUrl;

  return serviceUrl;
};

export const loginLogger = (content) => {
  return customLog(content, "login");
};

export const logoutLogger = (content) => {
  return customLog(content, "logout");
};

axios.interceptors.response.use((response) => {
  return response;
}, wafIntercept);
