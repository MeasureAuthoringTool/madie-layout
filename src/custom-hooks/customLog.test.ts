import * as React from "react";
import { waitFor } from "@testing-library/react";
import customLog, { loginLogger, logoutLogger } from "./customLog";
import { ServiceConfig, axios } from "@madie/madie-util";
const mockConfig: ServiceConfig = {
  loggingService: {
    baseUrl: "url",
  },
};

jest.mock("@madie/madie-util", () => ({
  axios: {
    get: jest.fn(),
    post: jest.fn(),
  },
  getServiceConfig: jest.fn(() => Promise.resolve(mockConfig)),
  useServiceConfig: jest.fn(() => mockConfig),
}));

describe("Custom Log", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should do logging", async () => {
    await customLog("test", "login", mockConfig);
    expect(axios.post).toBeCalledTimes(1);
  });

  it("should not do logging", async () => {
    await customLog("", "login", mockConfig);
    expect(axios.post).toBeCalledTimes(0);
  });

  it("Calling loginLogger should do logging", async () => {
    const mockCustomLog = jest.mock("./customLog", () => {
      return {
        customLog: jest.fn(() => {
          Promise.resolve();
        }),
      };
    });
    await loginLogger("test", mockConfig);
    waitFor(() => expect(mockCustomLog).toHaveBeenCalled());
  });

  it("Calling logoutLogger should do logging", async () => {
    const mockCustomLog = jest.mock("./customLog", () => {
      return {
        customLog: jest.fn(() => {
          Promise.resolve();
        }),
      };
    });
    await logoutLogger("test", mockConfig);
    waitFor(() => expect(mockCustomLog).toHaveBeenCalled());
  });
});
