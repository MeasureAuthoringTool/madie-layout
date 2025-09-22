import { AxiosResponse } from "axios";
import { ServiceConfig, axios } from "@madie/madie-util";

export default function customLog(
  input: any,
  action: string,
  serviceConfig: ServiceConfig
): Promise<AxiosResponse<any, any>> {
  const serviceUrl = serviceConfig?.loggingService?.baseUrl;
  if (
    input !== null &&
    input !== undefined &&
    Object.keys(input).length !== 0
  ) {
    return axios.post(`${serviceUrl}/log/${action}`, input);
  }
}

export const loginLogger = (content, serviceConfig: ServiceConfig) => {
  return customLog(content, "login", serviceConfig);
};

export const logoutLogger = (content, serviceConfig: ServiceConfig) => {
  return customLog(content, "logout", serviceConfig);
};
