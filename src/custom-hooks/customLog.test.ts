import * as React from "react";
import customLog, { getServiceUrl } from "./customLog";
import { ServiceConfig } from "./getServiceConfig";
import axios from "axios";

jest.mock("axios");

const mockConfig: ServiceConfig = {
  loggingService: {
    baseUrl: "url",
  },
};

jest.mock("./getServiceConfig", () => {
  return {
    getServiceConfig: jest.fn(() => Promise.resolve(mockConfig)),
  };
});

describe("Custom Log", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve the service url", async () => {
    const actual = await getServiceUrl();
    expect(actual).toBe("url");
  });

  it("should do logging", async () => {
    await customLog("test", "login");
    expect(axios.post).toBeCalledTimes(1);
  });

  it("should not do logging", async () => {
    await customLog("", "login");
    expect(axios.post).toBeCalledTimes(0);
  });
});
