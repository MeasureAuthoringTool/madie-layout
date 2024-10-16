import * as React from "react";
import { waitFor } from "@testing-library/react";
import customLog, {
  getServiceUrl,
  loginLogger,
  logoutLogger,
} from "./customLog";
import { ServiceConfig } from "./getServiceConfig";
import axios from "../../api/axios-instance";

jest.mock("../../api/axios-instance");

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

  it("Calling loginLogger should do logging", async () => {
    const mockCustomLog = jest.mock("./customLog", () => {
      return {
        customLog: jest.fn(() => {
          Promise.resolve();
        }),
      };
    });
    await loginLogger("test");
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
    await logoutLogger("test");
    waitFor(() => expect(mockCustomLog).toHaveBeenCalled());
  });
});
