import axios from "../api/axios-instance";
import { useEffect, useState } from "react";

export interface OktaConfig {
  baseUrl: string;
  issuer: string;
  clientId: string;
  redirectUri: string;
}

export interface ServiceConfig {
  measureService: {
    baseUrl: string;
  };
  elmTranslationService: {
    baseUrl: string;
  };
  cqlLibraryService: {
    baseUrl: string;
  };
  terminologyService: {
    baseUrl: string;
  };
}

const useGetServiceConfig = () => {
  const [config, setConfig] = useState<ServiceConfig | null>(null);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    axios
      .get<ServiceConfig>("/env-config/serviceConfig.json")
      .then((res) => {
        if (!res?.data?.cqlLibraryService?.baseUrl) {
          setError(new Error("Invalid Service Config"));
        }
        setConfig(res.data);
      })
      .catch((err) => {
        console.warn(
          "An error occurred while loading the service config: ",
          err
        );
        setError(new Error("Invalid Service Config"));
      });
  }, []);
  return { config, error };
};

export default useGetServiceConfig;
