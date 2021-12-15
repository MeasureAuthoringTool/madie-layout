import * as React from "react";
import OktaSecurity from "./OktaSecurity";
import { render, waitFor } from "@testing-library/react";
import oktaConfig from "./Config";

jest.mock("../router/Router", () => () => (
  <div data-testid="router-test-id">test</div>
));

jest.mock("./Config", () => ({
  getOktaConfig: jest.fn(() =>
    Promise.resolve({
      baseUrl: `https://dev-Example.okta.com`,
      redirectUri: "/login/callback",
      authParams: {
        issuer: "https://dev-Example.okta.com/oauth2/default",
        clientId: "0oa1t055g23yx2o5d7",
        redirectUri: "/login/callback",
      },
    })
  ),
}));

jest.mock("react-router-dom", () => ({
  useHistory: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

describe("Config component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be able to fetch oktaConfig", async () => {
    await waitFor(() => {
      const { getByTestId } = render(<OktaSecurity />);
      expect(getByTestId("router-test-id")).toBeInTheDocument();
    });
  });

  it("should handle get okta config error", async () => {
    oktaConfig.getOktaConfig = jest.fn().mockImplementation((url: string) =>
      Promise.reject('Error')
    );

    await waitFor(() => {
      const { getByTestId } = render(<OktaSecurity />);
      expect(getByTestId("login-page-message")).toBeInTheDocument();
    });
  });
});
