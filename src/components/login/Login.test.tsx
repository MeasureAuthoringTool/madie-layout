import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Login from "./Login";
import { MemoryRouter } from "react-router";
import { useOktaAuth } from "@okta/okta-react";
import userEvent from "@testing-library/user-event";
import { loginLogger, logoutLogger } from "../../custom-hooks/customLog";

jest.mock("@okta/okta-react", () => ({
  useOktaAuth: jest.fn(),
}));
const mockConfig = {
  measureService: {
    baseUrl: "example-service-url",
  },
  cqlLibraryService: {
    baseUrl: "test-cql-library-service-url",
  },
  loggingService: {
    baseUrl: "test-logging-service-url",
  },
};
// Keep existing mocks...

const mockUnlockMeasures = jest.fn();

const mockUnlockLibraries = jest.fn();

jest.mock("@madie/madie-util", () => ({
  useDocumentTitle: jest.fn(),
  useServiceConfig: jest.fn(() => mockConfig),
  useMeasureServiceApi: () => ({
    getUserInfo: jest.fn().mockResolvedValue({}),
    unlockMeasures: mockUnlockMeasures,
  }),
  useCqlLibraryServiceApi: () => ({
    getUserInfo: jest.fn().mockResolvedValue({}),
    unlockLibraries: mockUnlockLibraries,
  }),
}));

const mockLogoutLogger = jest.fn((args) => {
  Promise.resolve("logged out ");
});
jest.mock("../../custom-hooks/customLog", () => {
  return {
    logoutLogger: (args) => {
      return mockLogoutLogger(args);
    },
  };
});

describe("Login component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should return null if authState is undefined", async () => {
    mockUnlockMeasures.mockImplementationOnce(() => {
      return {};
    });
    (useOktaAuth as jest.Mock).mockImplementation(() => ({
      oktaAuth: {},
      authState: null,
    }));

    const { container } = render(
      <MemoryRouter>
        <Login config={{}} />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
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
    await waitFor(() => {
      expect(mockUnlockMeasures).not.toHaveBeenCalled();
      expect(mockUnlockLibraries).not.toHaveBeenCalled();
    });
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
    await waitFor(() => {
      expect(mockUnlockMeasures).toHaveBeenCalled();
      expect(mockUnlockLibraries).toHaveBeenCalled();
    });
  });

  it("should not mount login widget if authenticated, but unlock fails", async () => {
    mockUnlockMeasures.mockImplementation(() => {
      throw new Error("Network error");
    });

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
    await waitFor(() => {
      expect(() => mockUnlockMeasures()).toThrow("Network error");
      expect(mockUnlockMeasures).toHaveBeenCalled();
      expect(mockUnlockLibraries).toHaveBeenCalledTimes(0);
    });
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
    await waitFor(() => expect(mockHandleLoginRedirect).toBeCalled());
  });
  it("Should login successfully with user info logged, even if unlock fails", async () => {
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
    await waitFor(() => expect(mockHandleLoginRedirect).toBeCalled());
  });
});
