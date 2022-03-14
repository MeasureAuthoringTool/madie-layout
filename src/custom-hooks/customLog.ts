import axios from "axios";
import { ServiceConfig, getServiceConfig } from "./getServiceConfig";

const customLog = async (input, action) => {
  if (input != null) {
    const serviceUrl = await getServiceUrl();

    return axios.post(`${serviceUrl}/log/${action}`, input);
  }
};

export const getServiceUrl = async () => {
  const config: ServiceConfig = await getServiceConfig();
  const serviceUrl: string = config?.loggingService?.baseUrl;

  return serviceUrl;
};

export const loginLogger = (content) => {
  customLog(content, "login");
};

export const logoutLogger = (content) => {
  customLog(content, "logout");
};
