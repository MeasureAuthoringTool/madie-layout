import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Login from "./Login";
import { MemoryRouter } from "react-router";
import { useOktaAuth } from "@okta/okta-react";

jest.mock("@okta/okta-react", () => ({
  useOktaAuth: jest.fn(),
}));

describe("Login component", () => {
  it("should return null if authState is undefined", async () => {
    (useOktaAuth as jest.Mock).mockImplementation(() => ({
      oktaAuth: {},
      authState: null,
    }));

    expect(Login({ config: {} })).toBeNull();
  });

  it("should mount login widget is loaded if not authenticated", async () => {
    const oktaAuth = { handleLoginRedirect: jest.fn() };
    (useOktaAuth as jest.Mock).mockImplementation(() => ({
      oktaAuth,
      authState: { isAuthenticated: false },
    }));

    const loginProps = {
      config: {},
      onSuccess: (tokens) => oktaAuth.handleLoginRedirect(tokens),
    };

    const { getByTestId } = render(
      <MemoryRouter>
        <Login {...loginProps} />
      </MemoryRouter>
    );
    expect(getByTestId("login-testid")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("login-testid"));
    expect(oktaAuth.handleLoginRedirect).toHaveBeenCalled();
  });

  it("should not mount login widget if authenticated", async () => {
    const loginProps = { config: {} };
    (useOktaAuth as jest.Mock).mockImplementation(() => ({
      oktaAuth: {},
      authState: { isAuthenticated: true },
    }));

    const { queryByTestId } = render(
      <MemoryRouter>
        <Login {...loginProps} />
      </MemoryRouter>
    );
    expect(queryByTestId("login-testid")).toBeNull();
  });
});
