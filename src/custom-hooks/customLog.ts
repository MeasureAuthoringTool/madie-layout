import { AxiosResponse } from "axios";
import { ServiceConfig, axios } from "@madie/madie-util";

export default function customLog(
  input: any,
  action: string,
  config: ServiceConfig
): Promise<AxiosResponse<any, any>> {
  const serviceUrl = config?.loggingService?.baseUrl;
  if (
    input !== null &&
    input !== undefined &&
    Object.keys(input).length !== 0
  ) {
    return axios.post(`${serviceUrl}/log/${action}`, input);
  }
}

export const loginLogger = (content, config: ServiceConfig) => {
  return customLog(content, "login", config);
};

export const logoutLogger = (content, config: ServiceConfig) => {
  return customLog(content, "logout", config);
};
