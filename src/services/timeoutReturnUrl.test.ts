import {
  MADIE_TIMEOUT_RETURN_URL,
  setTimeoutReturnUrl,
  getTimeoutReturnUrl,
  clearTimeoutReturnUrl,
  consumeTimeoutReturnUrl,
} from "./timeoutReturnUrl";

describe("timeoutReturnUrl", () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.restoreAllMocks();
  });

  it("stores and returns a valid internal path", () => {
    setTimeoutReturnUrl("/measures/123");

    expect(sessionStorage.getItem(MADIE_TIMEOUT_RETURN_URL)).toBe(
      "/measures/123"
    );
    expect(getTimeoutReturnUrl()).toBe("/measures/123");
  });

  it("ignores invalid paths that are not internal routes", () => {
    const setItemSpy = jest.spyOn(Storage.prototype, "setItem");

    setTimeoutReturnUrl("https://example.com/measures/123");

    expect(setItemSpy).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(MADIE_TIMEOUT_RETURN_URL)).toBeNull();
  });

  it("logs a warning if sessionStorage write fails", () => {
    const error = new Error("QuotaExceededError");
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw error;
    });

    expect(() => setTimeoutReturnUrl("/measures/123")).not.toThrow();
    expect(warnSpy).toHaveBeenCalledWith(
      "[TimeoutReturnUrl] Unable to write timeout return URL to sessionStorage",
      error
    );
  });

  it("logs a warning and returns null if sessionStorage read fails", () => {
    const error = new Error("SecurityError");
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw error;
    });

    expect(getTimeoutReturnUrl()).toBeFalsy();
    expect(warnSpy).toHaveBeenCalledWith(
      "[TimeoutReturnUrl] Unable to read timeout return URL from sessionStorage",
      error
    );
  });

  it("clears the stored value and logs a warning if sessionStorage remove fails", () => {
    const error = new Error("SecurityError");
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();
    jest.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw error;
    });

    expect(() => clearTimeoutReturnUrl()).not.toThrow();
    expect(warnSpy).toHaveBeenCalledWith(
      "[TimeoutReturnUrl] Unable to clear timeout return URL from sessionStorage",
      error
    );
  });

  it("consumes the value and removes it from storage", () => {
    setTimeoutReturnUrl("/libraries");

    expect(consumeTimeoutReturnUrl()).toBe("/libraries");
    expect(sessionStorage.getItem(MADIE_TIMEOUT_RETURN_URL)).toBeNull();
  });
});
