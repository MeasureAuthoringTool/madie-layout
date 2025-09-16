import { useEffect, useState } from "react";
import { ServiceConfig, axios } from "@madie/madie-util";

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
