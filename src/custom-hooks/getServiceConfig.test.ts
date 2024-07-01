import * as React from "react";
import { getServiceConfig, ServiceConfig } from "./getServiceConfig";
import axios from "../../api/axios-instance";

jest.mock("../../api/axios-instance");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Logging Service Config", () => {
  it("should retrieve the service configuration info", () => {
    expect.assertions(1);
    const config: ServiceConfig = {
      loggingService: {
        baseUrl: "url",
      },
      terminologyService: {
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

describe("Terminology Service Config", () => {
  it("should retrieve terminology service configuration info", () => {
    expect.assertions(1);
    const config: ServiceConfig = {
      loggingService: {
        baseUrl: "url",
      },
      terminologyService: {
        baseUrl: "url",
      },
    };
    const resp = { data: config };
    mockedAxios.get.mockResolvedValue(resp);
    getServiceConfig().then((result) => expect(result).toEqual(config));
  });

  it("should error if the config is inaccessible", async () => {
    expect.assertions(1);
    const resp = {
      data: {
        loggingService: {
          baseUrl: "url",
        },
      },
    };
    mockedAxios.get.mockResolvedValue(resp);
    try {
      await getServiceConfig();
    } catch (err) {
      expect(err.message).toBe("Invalid Terminology Service Config");
    }
  });
});
