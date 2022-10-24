import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Login from "./Login";
import { MemoryRouter } from "react-router";
import { useOktaAuth } from "@okta/okta-react";
import userEvent from "@testing-library/user-event";

jest.mock("@okta/okta-react", () => ({
  useOktaAuth: jest.fn(),
}));

jest.mock("@madie/madie-util", () => ({
  useDocumentTitle: jest.fn(),
}));

const mockLoginLogger = jest.fn((args) => {
  Promise.resolve("logged");
});
jest.mock("../../custom-hooks/customLog", () => {
  //lazy load the mock otherwise will thorw ReferenceError: Cannot access 'mockLoginLogger' before initialization
  return {
    loginLogger: (args) => {
      return mockLoginLogger(args);
    },
  };
});

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

  it("Should login successfully with user info logged", async () => {
    const oktaAuth = { handleLoginRedirect: jest.fn() };
    const loginProps = {
      config: {},
      onSuccess: (tokens) => oktaAuth.handleLoginRedirect(tokens),
    };
    const mockHandleLoginRedirect = jest.fn();
    const mockGetUserInfo = jest.fn().mockImplementation(() => {
      return Promise.resolve();
    });
    const mockToken = { getUserInfo: mockGetUserInfo };
    (useOktaAuth as jest.Mock).mockImplementation(() => ({
      oktaAuth: {
        token: mockToken,
        handleLoginRedirect: mockHandleLoginRedirect,
      },
      authState: { isAuthenticated: false },
    }));

    render(
      <MemoryRouter>
        <Login {...loginProps} />
      </MemoryRouter>
    );

    const loginButton = screen.getByRole("button", { name: "Login Widget" });
    userEvent.click(loginButton);
    expect(mockHandleLoginRedirect).toBeCalled();
    await waitFor(() => expect(mockLoginLogger).toHaveBeenCalled());
  });
});
