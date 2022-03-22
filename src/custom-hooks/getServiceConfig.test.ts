import * as React from "react";
import { getServiceConfig, ServiceConfig } from "./getServiceConfig";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Logging Service Config", () => {
  it("should retrieve the service configuration info", () => {
    expect.assertions(1);
    const config: ServiceConfig = {
      loggingService: {
        baseUrl: "url",
      },
    };
    const resp = { data: config };
    mockedAxios.get.mockResolvedValue(resp);
    getServiceConfig().then((result) => expect(result).toEqual(config));
  });

  it("should error if the config is inaccessible", async () => {
    expect.assertions(1);
    const resp = { data: {} };
    mockedAxios.get.mockResolvedValue(resp);
    try {
      await getServiceConfig();
    } catch (err) {
      expect(err.message).toBe("Invalid Logging Service Config");
    }
  });
});
