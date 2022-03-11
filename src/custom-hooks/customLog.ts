//MAT-3804
import log from "loglevel";
import remote from "loglevel-plugin-remote";
import loglevelServerSend from "./loglevel-serverSend";
import axios from "axios";
import { ServiceConfig, getServiceConfig } from "./getServiceConfig";

const customLog = async (input, level, action) => {
  if (input != null) {
    const config: ServiceConfig = await getServiceConfig();
    const serviceUrl = config?.loggingService?.baseUrl;

    return axios.post(`${serviceUrl}/log/${action}`, input);
  }
};

export const loginLogger = (content, level) => {
  customLog(content, level, "login");
};

export const logoutLogger = (content, level) => {
  customLog(content, level, "logout");
};
