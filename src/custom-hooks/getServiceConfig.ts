import axios from "../../api/axios-instance";

export interface ServiceConfig {
  loggingService: {
    baseUrl: string;
  };
  terminologyService: {
    baseUrl: string;
  };
  madieVersion: string;
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

  if (
    !(
      serviceConfig?.terminologyService &&
      serviceConfig.terminologyService.baseUrl
    )
  ) {
    throw new Error("Invalid Terminology Service Config");
  }

  return serviceConfig;
}
