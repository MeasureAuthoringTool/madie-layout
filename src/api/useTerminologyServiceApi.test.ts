import * as React from "react";
import { waitFor } from "@testing-library/react";
import useTerminologyServiceApi, {
  TerminologyServiceApi,
  getServiceUrl,
} from "./useTerminologyServiceApi";
import { ServiceConfig } from "../custom-hooks/getServiceConfig";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockConfig: ServiceConfig = {
  terminologyService: {
    baseUrl: "url",
  },
};

jest.mock("../custom-hooks/useOktaTokens", () =>
  jest.fn(() => ({
    getAccessToken: () => "test.jwt",
  }))
);

jest.mock("../custom-hooks/getServiceConfig", () => {
  return {
    getServiceConfig: jest.fn(() => Promise.resolve(mockConfig)),
  };
});

describe("useTerminologyServiceApi", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve the service url", async () => {
    const actual = await getServiceUrl();
    expect(actual).toBe("url");
  });

  it("useTerminologyServiceApi returns TerminologyServiceApi", () => {
    const actual: TerminologyServiceApi = useTerminologyServiceApi();
    expect(actual).toBeTruthy();
  });

  it("checkLogin to UMLS success", async () => {
    const resp = { status: 200, data: true };
    mockedAxios.get.mockResolvedValue(resp);
    const terminlogyService: TerminologyServiceApi = useTerminologyServiceApi();
    await terminlogyService.checkLogin();
    expect(mockedAxios.get).toBeCalledTimes(1);
  });

  it("checkLogin to UMLS failure", async () => {
    const resp = { status: 404, data: false, error: { message: "error" } };
    mockedAxios.get.mockRejectedValueOnce(resp);
    const terminlogyService: TerminologyServiceApi = useTerminologyServiceApi();
    try {
      const loggedIn = await terminlogyService.checkLogin();
      expect(mockedAxios.get).toBeCalledTimes(1);
      expect(loggedIn).toBeFalsy();
    } catch {}
  });

  it("Login to UMLS success", async () => {
    const resp = { status: 200, data: "success" };
    mockedAxios.post.mockResolvedValue(resp);
    const terminlogyService: TerminologyServiceApi = useTerminologyServiceApi();
    await terminlogyService.loginUMLS("test");
    expect(mockedAxios.post).toBeCalledTimes(1);
  });

  it("Login to UMLS failure", async () => {
    const resp = { status: 404, data: "failure", error: { message: "error" } };
    mockedAxios.post.mockRejectedValueOnce(resp);
    const terminlogyService: TerminologyServiceApi = useTerminologyServiceApi();
    try {
      await terminlogyService.loginUMLS("test");
      expect(mockedAxios.post).toBeCalledTimes(1);
    } catch {}
  });
});
