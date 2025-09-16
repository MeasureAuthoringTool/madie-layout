import * as React from "react";

import { ServiceConfig, axios } from "@madie/madie-util";
import { get } from "@okta/okta-auth-js";
import { getServiceConfig } from "./getServiceConfig";

jest.mock("@madie/madie-util", () => ({
  axios: {
    get: jest.fn(),
  },
}));

describe("Logging Service Config", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve the service configuration info", () => {
    //expect.assertions(1);
    const config: ServiceConfig = {
      loggingService: {
        baseUrl: "url",
      },
      terminologyService: {
        baseUrl: "url",
      },
    };
    const resp = { data: config };
    axios.get.mockResolvedValue(resp);
    getServiceConfig().then((result: ServiceConfig) =>
      expect(result).toEqual(config)
    );
  });

  it("should error if the config is inaccessible", async () => {
    expect.assertions(1);
    const resp = { data: {} };
    axios.get.mockResolvedValue(resp);
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
    axios.get.mockResolvedValue(resp);
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
    axios.get.mockResolvedValue(resp);
    try {
      await getServiceConfig();
    } catch (err) {
      expect(err.message).toBe("Invalid Terminology Service Config");
    }
  });
});
