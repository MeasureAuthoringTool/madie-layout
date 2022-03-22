import axios from "axios";

export interface ServiceConfig {
  loggingService: {
    baseUrl: string;
  };
}

export async function getServiceConfig(): Promise<ServiceConfig> {
  const serviceConfig: ServiceConfig = (
    await axios.get<ServiceConfig>("/env-config/serviceConfig.json")
  ).data;
  if (
    !(serviceConfig?.loggingService && serviceConfig.loggingService.baseUrl)
  ) {
    throw new Error("Invalid Logging Service Config");
  }

  return serviceConfig;
}
