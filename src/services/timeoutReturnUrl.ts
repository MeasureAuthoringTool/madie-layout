/**
 * Stores and retrieves the one-time return path used only for inactivity
 * logout flows.
 *
 * Behavior:
 * - scoped to a single browser tab via sessionStorage
 * - set on automatic inactivity sign-out
 * - cleared on manual sign-out
 * - consumed (read + removed) after successful re-authentication
 */
const MADIE_TIMEOUT_RETURN_URL = "madie_timeout_return_url";

const isValidInternalPath = (value: string | null): value is string =>
  typeof value === "string" && value.startsWith("/");

const setTimeoutReturnUrl = (path: string): void => {
  if (!isValidInternalPath(path)) {
    return;
  }

  try {
    sessionStorage.setItem(MADIE_TIMEOUT_RETURN_URL, path);
  } catch (e) {
    console.warn(
      "[TimeoutReturnUrl] Unable to write timeout return URL to sessionStorage",
      e
    );
  }
};

const getTimeoutReturnUrl = (): string | null => {
  try {
    const stored = sessionStorage.getItem(MADIE_TIMEOUT_RETURN_URL);
    return isValidInternalPath(stored) ? stored : null;
  } catch (e) {
    console.warn(
      "[TimeoutReturnUrl] Unable to read timeout return URL from sessionStorage",
      e
    );
  }
};

const clearTimeoutReturnUrl = (): void => {
  try {
    sessionStorage.removeItem(MADIE_TIMEOUT_RETURN_URL);
  } catch (e) {
    console.warn(
      "[TimeoutReturnUrl] Unable to clear timeout return URL from sessionStorage",
      e
    );
  }
};

const consumeTimeoutReturnUrl = (): string | null => {
  const value = getTimeoutReturnUrl();
  clearTimeoutReturnUrl();
  return value;
};

export {
  MADIE_TIMEOUT_RETURN_URL,
  setTimeoutReturnUrl,
  getTimeoutReturnUrl,
  clearTimeoutReturnUrl,
  consumeTimeoutReturnUrl,
};
