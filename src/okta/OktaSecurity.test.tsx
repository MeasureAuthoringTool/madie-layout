import "@testing-library/jest-dom";

import * as React from "react";
import OktaSecurity from "./OktaSecurity";
import { act, render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, test } from "@jest/globals";
import oktaConfig from "./Config";

jest.mock("../router/Router", () => () => (
  <div data-testid="router-test-id">test</div>
));

jest.mock("./Config", () => ({
  getOktaConfig: jest.fn(() =>
    Promise.resolve({
      baseUrl: `https://dev-Example.okta.com`,
      issuer: "https://dev-Example.okta.com/oauth2/authzServerId",
      clientId: "0oa1t055g23yx2o5d7",
      redirectUri: "/login/callback",
    })
  ),
}));

jest.mock("@okta/okta-react", () => ({
  Security: (props) => {
    const FakeSecurity = "very-fake-security";
    return <FakeSecurity {...props} />;
  },
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

  test("should be able to fetch oktaConfig", async () => {
    await act(async () => {
      const { findByTestId } = await render(
        <MemoryRouter>
          <OktaSecurity />
        </MemoryRouter>
      );
      const router = await findByTestId("router-test-id");
      expect(router).toBeInTheDocument();
    });
  });

  test("should handle get okta config error", async () => {
    oktaConfig.getOktaConfig = jest
      .fn()
      .mockImplementation((url: string) =>
        Promise.reject({ oktaAuthConfig: "undefined" })
      );
    await act(async () => {
      const { findByTestId } = await render(
        <MemoryRouter>
          <OktaSecurity />
        </MemoryRouter>
      );
      const loginPage = await findByTestId("login-page-message");
      expect(loginPage).toBeInTheDocument();
    });
  });
});
