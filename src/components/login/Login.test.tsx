import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Login from "./Login";
import { MemoryRouter } from "react-router";
import { useOktaAuth } from "@okta/okta-react";
import userEvent from "@testing-library/user-event";

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

const mockLoginUser = jest.fn();

// Mock loginLogger function
jest.mock("../../custom-hooks/customLog", () => ({
  loginLogger: jest.fn(),
}));

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
  useUserServiceApi: () => ({
    loginUser: mockLoginUser,
  }),
}));

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
    const mockHandleLoginRedirect = jest.fn();
    const mockGetUserInfo = jest.fn().mockResolvedValue({ sub: "user123" });
    const mockToken = { getUserInfo: mockGetUserInfo };

    const oktaAuth = {
      handleLoginRedirect: mockHandleLoginRedirect,
      token: mockToken,
    };

    (useOktaAuth as jest.Mock).mockImplementation(() => ({
      oktaAuth,
      authState: { isAuthenticated: false },
    }));

    const { getByTestId } = render(
      <MemoryRouter>
        <Login config={{}} />
      </MemoryRouter>
    );
    expect(getByTestId("login-testid")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("login-testid"));

    await waitFor(() => {
      expect(mockHandleLoginRedirect).toHaveBeenCalled();
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
    const mockHandleLoginRedirect = jest.fn();
    const mockGetUserInfo = jest.fn().mockResolvedValue({ sub: "user123" });
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
        <Login config={{}} />
      </MemoryRouter>
    );

    const loginButton = screen.getByRole("button", { name: "Login Widget" });
    userEvent.click(loginButton);
    await waitFor(() => expect(mockHandleLoginRedirect).toBeCalled());
  });
  it("Should login successfully with user info logged, even if unlock fails", async () => {
    const mockHandleLoginRedirect = jest.fn();
    const mockGetUserInfo = jest.fn().mockResolvedValue({ sub: "user123" });
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
        <Login config={{}} />
      </MemoryRouter>
    );

    const loginButton = screen.getByRole("button", { name: "Login Widget" });
    userEvent.click(loginButton);
    await waitFor(() => expect(mockHandleLoginRedirect).toBeCalled());
  });

  it("should call loginUser with access token on successful login", async () => {
    mockLoginUser.mockResolvedValue({ success: true });

    const mockHandleLoginRedirect = jest.fn();
    const mockGetUserInfo = jest.fn().mockResolvedValue({ sub: "user123" });
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
        <Login config={{}} />
      </MemoryRouter>
    );

    // Click the login widget to trigger onSuccess with mock tokens
    const loginWidget = screen.getByTestId("login-testid");
    fireEvent.click(loginWidget);

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith("mock-access-token");
      expect(mockHandleLoginRedirect).toHaveBeenCalled();
    });
  });

  it("should continue login process even if loginUser fails", async () => {
    const loginError = new Error("Login service unavailable");
    mockLoginUser.mockRejectedValue(loginError);

    const mockHandleLoginRedirect = jest.fn();
    const mockGetUserInfo = jest.fn().mockResolvedValue({ sub: "user123" });
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
        <Login config={{}} />
      </MemoryRouter>
    );

    // Click the login widget to trigger onSuccess
    const loginWidget = screen.getByTestId("login-testid");
    fireEvent.click(loginWidget);

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith("mock-access-token");
      expect(mockHandleLoginRedirect).toHaveBeenCalled();
    });
  });

  it("should handle loginUser success and store user data", async () => {
    const mockUserData = { id: "user123", roles: ["USER"] };
    mockLoginUser.mockResolvedValue(mockUserData);

    const mockHandleLoginRedirect = jest.fn();
    const mockGetUserInfo = jest.fn().mockResolvedValue({ sub: "user123" });
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
        <Login config={{}} />
      </MemoryRouter>
    );

    // Click the login widget to trigger onSuccess
    const loginWidget = screen.getByTestId("login-testid");
    fireEvent.click(loginWidget);

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith("mock-access-token");
      expect(mockHandleLoginRedirect).toHaveBeenCalled();
    });

    // Verify that mockLoginUser was resolved with the expected user data
    expect(mockLoginUser).toHaveReturnedWith(Promise.resolve(mockUserData));
  });
});
