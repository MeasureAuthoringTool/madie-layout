import axios from "./axios-instance";
import useServiceConfig from "./useServiceConfig";
import { ServiceConfig } from "./ServiceContext";
import { CqlLibrary } from "@madie/madie-models";
import useOktaTokens from "../hooks/useOktaTokens";

export class CqlLibraryServiceApi {
  constructor(private baseUrl: string, private getAccessToken: () => string) {}

  async fetchAllOwners(librarySetIds: string[]): Promise<any> {
    const idsParam = librarySetIds.join(",");
    try {
      const response = await axios.get<any>(
        `${this.baseUrl}/cql-libraries/getAllOwners`,
        {
          headers: {
            Authorization: `Bearer ${this.getAccessToken()}`,
          },
          params: {
            librarySetIds: idsParam,
          },
        }
      );
      return response.data;
    } catch (err) {
      const message = `Unable to fetch library owners`;
      console.error(message, err);
      throw new Error(message);
    }
  }
}

export default function useCqlLibraryServiceApi() {
  const serviceConfig: ServiceConfig = useServiceConfig();
  const { getAccessToken } = useOktaTokens();
  const { baseUrl } = serviceConfig.cqlLibraryService;

  return new CqlLibraryServiceApi(baseUrl, getAccessToken);
}
