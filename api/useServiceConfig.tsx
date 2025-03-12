import { useContext } from "react";
import ServiceContext, { ServiceConfig } from "./ServiceContext";

export default function useServiceConfig(): ServiceConfig {
  return useContext(ServiceContext);
}
