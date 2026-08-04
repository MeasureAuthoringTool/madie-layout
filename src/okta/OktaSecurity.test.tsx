import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import OktaSecurity, {
  transformAuthState,
  resetSessionCheckCache,
} from "./OktaSecurity";
import * as madieUtil from "@madie/madie-util";
import { OktaAuth, toRelativeUrl } from "@okta/okta-auth-js";
import { Security } from "@okta/okta-react";
import { MADIE_TIMEOUT_RETURN_URL } from "../services/timeoutReturnUrl";

// Mock dependencies
jest.mock("@madie/madie-util", () => ({
  getOktaConfig: jest.fn(),
}));
jest.mock("@okta/okta-react", () => ({
  Security: jest.fn(({ children }) => (
    <div data-testid="security">{children}</div>
  )),
}));
jest.mock("@okta/okta-auth-js", () => ({
  OktaAuth: jest.fn().mockImplementation((config) => ({ options: config })),
  toRelativeUrl: jest.fn((uri) => uri),
}));
jest.mock("./../router/Router", () =>
  jest.fn(() => <div data-testid="router" />)
);

describe("OktaSecurity", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it("renders loading message initially", () => {
    (madieUtil.getOktaConfig as jest.Mock).mockReturnValue(
      new Promise(() => {})
    );
    render(<OktaSecurity />);
    expect(screen.getByTestId("login-page-message")).toHaveTextContent(
      "Loading..."
    );
  });

  it("renders error message if getOktaConfig fails", async () => {
    (madieUtil.getOktaConfig as jest.Mock).mockRejectedValue(new Error("fail"));
    render(<OktaSecurity />);
    await waitFor(() =>
      expect(screen.getByTestId("login-page-message")).toHaveTextContent(
        "Unable to load Login page, Please contact administration"
      )
    );
  });

  it("renders Security and Router when oktaConfig is loaded", async () => {
    (madieUtil.getOktaConfig as jest.Mock).mockResolvedValue({
      issuer: "https://example.com/oauth2/default",
      clientId: "clientId",
      redirectUri: "http://localhost:3000/login/callback",
      scopes: ["openid", "profile", "email"],
    });
    render(<OktaSecurity />);
    await waitFor(() => {
      expect(screen.getByTestId("security")).toBeInTheDocument();
      expect(screen.getByTestId("router")).toBeInTheDocument();
    });
  });

  it("prioritizes timeout return URL over originalUri and clears it after use", async () => {
    (madieUtil.getOktaConfig as jest.Mock).mockResolvedValue({
      issuer: "https://example.com/oauth2/default",
      clientId: "clientId",
      redirectUri: "http://localhost:3000/login/callback",
      scopes: ["openid", "profile", "email"],
    });
    render(<OktaSecurity />);
    await waitFor(() => expect(OktaAuth).toHaveBeenCalled());

    const config = (OktaAuth as unknown as jest.Mock).mock.calls[0][0];
    expect(config.tokenManager).toEqual({
      autoRenew: true,
      storage: "localStorage",
    });
    expect(config.services).toEqual({
      autoRenew: true,
      syncStorage: true,
      renewOnTabActivation: true,
      tabInactivityDuration: 1800,
    });

    sessionStorage.setItem(MADIE_TIMEOUT_RETURN_URL, "/libraries");
    render(<OktaSecurity />);
    await waitFor(() =>
      expect(screen.getByTestId("security")).toBeInTheDocument()
    );

    const securityProps = (Security as jest.Mock).mock.calls[0][0];
    await securityProps.restoreOriginalUri({}, "/from-okta");

    expect(toRelativeUrl).toHaveBeenCalledWith(
      "/libraries",
      window.location.origin
    );
    expect(sessionStorage.getItem(MADIE_TIMEOUT_RETURN_URL)).toBeNull();
  });

  it("falls back to originalUri when timeout return URL is not set", async () => {
    (madieUtil.getOktaConfig as jest.Mock).mockResolvedValue({
      issuer: "https://example.com/oauth2/default",
      clientId: "clientId",
      redirectUri: "http://localhost:3000/login/callback",
      scopes: ["openid", "profile", "email"],
    });

    render(<OktaSecurity />);
    await waitFor(() =>
      expect(screen.getByTestId("security")).toBeInTheDocument()
    );

    const securityProps = (Security as jest.Mock).mock.calls[0][0];
    await securityProps.restoreOriginalUri({}, "/from-okta");

    expect(toRelativeUrl).toHaveBeenCalledWith(
      "/from-okta",
      window.location.origin
    );
  });

  it("falls back to /measures when neither timeout return URL nor originalUri is set", async () => {
    (madieUtil.getOktaConfig as jest.Mock).mockResolvedValue({
      issuer: "https://example.com/oauth2/default",
      clientId: "clientId",
      redirectUri: "http://localhost:3000/login/callback",
      scopes: ["openid", "profile", "email"],
    });

    render(<OktaSecurity />);
    await waitFor(() =>
      expect(screen.getByTestId("security")).toBeInTheDocument()
    );

    const securityProps = (Security as jest.Mock).mock.calls[0][0];
    await securityProps.restoreOriginalUri({}, undefined);

    expect(toRelativeUrl).toHaveBeenCalledWith(
      "/measures",
      window.location.origin
    );
  });

  describe("transformAuthState", () => {
    const buildOktaAuth = (existsMock: jest.Mock) => ({
      session: { exists: existsMock },
    });

    beforeEach(() => {
      resetSessionCheckCache();
    });

    it("returns the auth state untouched when not authenticated, without a session check", async () => {
      const exists = jest.fn();
      const authState = { isAuthenticated: false };

      const result = await transformAuthState(buildOktaAuth(exists), authState);

      expect(result.isAuthenticated).toBe(false);
      expect(exists).not.toHaveBeenCalled();
    });

    it("keeps the user authenticated when the Okta session exists", async () => {
      const exists = jest.fn().mockResolvedValue(true);
      const authState = { isAuthenticated: true };

      const result = await transformAuthState(buildOktaAuth(exists), authState);

      expect(result.isAuthenticated).toBe(true);
      expect(exists).toHaveBeenCalledTimes(1);
    });

    it("trusts a recent successful session check instead of re-verifying", async () => {
      const exists = jest.fn().mockResolvedValue(true);
      const oktaAuth = buildOktaAuth(exists);

      await transformAuthState(oktaAuth, { isAuthenticated: true });
      const result = await transformAuthState(oktaAuth, {
        isAuthenticated: true,
      });

      // second call within the TTL should not hit the network again
      expect(exists).toHaveBeenCalledTimes(1);
      expect(result.isAuthenticated).toBe(true);
    });

    it("retries once before dropping auth when the session check fails transiently", async () => {
      const exists = jest
        .fn()
        .mockResolvedValueOnce(false) // transient failure
        .mockResolvedValueOnce(true); // retry succeeds
      const authState = { isAuthenticated: true };

      const result = await transformAuthState(buildOktaAuth(exists), authState);

      expect(exists).toHaveBeenCalledTimes(2);
      expect(result.isAuthenticated).toBe(true);
    });

    it("drops authentication when the Okta session is really gone", async () => {
      const exists = jest.fn().mockResolvedValue(false);
      const authState = { isAuthenticated: true };

      const result = await transformAuthState(buildOktaAuth(exists), authState);

      expect(exists).toHaveBeenCalledTimes(2);
      expect(result.isAuthenticated).toBe(false);
    });
  });
});
