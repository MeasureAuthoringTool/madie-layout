import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import OktaSecurity from "./OktaSecurity";
import * as madieUtil from "@madie/madie-util";
import { OktaAuth } from "@okta/okta-auth-js";

// Mock dependencies
jest.mock("@madie/madie-util", () => ({
  getOktaConfig: jest.fn(),
}));
jest.mock("@okta/okta-react", () => ({
  Security: jest.fn(({ children }) => (
    <div data-testid="security">{children}</div>
  )),
}));
// Mock the Okta SDK so we exercise OktaSecurity's wiring/config without the
// real constructor (which does browser storage feature-detection that fails
// under jsdom when storage: "localStorage" is set explicitly).
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

  it("configures OktaAuth for cross-tab token renewal and sync", async () => {
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
      autoRenew: false,
      syncStorage: true,
      renewOnTabActivation: true,
      tabInactivityDuration: 1800,
    });
  });
});
