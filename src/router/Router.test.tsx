import React from "react";
import { render, waitFor } from "@testing-library/react";
import Router from "./Router";
import { useOktaAuth } from "@okta/okta-react";
import { MADIE_TIMEOUT_RETURN_URL } from "../services/timeoutReturnUrl";

jest.mock("@okta/okta-react", () => ({
  LoginCallback: jest.fn(() => <div data-testid="login-callback" />),
  useOktaAuth: jest.fn(),
}));

jest.mock("@madie/madie-util", () => ({
  ApiContextProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  getServiceConfig: jest.fn().mockResolvedValue({}),
}));

jest.mock("@madie/madie-measure", () => ({
  MadieMeasure: jest.fn(() => <div data-testid="measure" />),
}));

jest.mock("@madie/madie-cql-library", () => ({
  MadieCqlLibrary: jest.fn(() => <div data-testid="cql-library" />),
}));

jest.mock(
  "@madie/madie-admin",
  () => ({
    MadieAdmin: jest.fn(() => <div data-testid="admin" />),
  }),
  { virtual: true }
);

jest.mock("../components/login/Login", () =>
  jest.fn(() => <div data-testid="login" />)
);

jest.mock("../components/notfound/NotFound", () =>
  jest.fn(() => <div data-testid="not-found" />)
);

jest.mock("../components/timeoutWarningDialog/TimeoutWarningDialog", () =>
  jest.fn(() => <div data-testid="timeout-warning" />)
);

jest.mock("../custom-hooks/useInactivityLogout", () => ({
  InactivityLogout: jest.fn(() => null),
}));

jest.mock("./LayoutWrapper", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("Router", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jest.clearAllMocks();
    (global as any).Request = class Request {
      url: string;
      signal: AbortSignal | null;

      constructor(input: RequestInfo | URL, init?: RequestInit) {
        this.url = String(input);
        this.signal = init?.signal ?? null;
      }

      clone() {
        return this;
      }
    };
  });

  it("stores the requested URL before redirecting an unauthenticated user to login", async () => {
    (useOktaAuth as jest.Mock).mockReturnValue({
      authState: { isAuthenticated: false },
    });

    window.history.replaceState(
      {},
      "",
      "/admin/userProfile/ethan.kaplan%40icf.com"
    );

    render(<Router props={{ oktaSignInConfig: {} }} />);

    await waitFor(() => {
      expect(sessionStorage.getItem(MADIE_TIMEOUT_RETURN_URL)).toBe(
        "/admin/userProfile/ethan.kaplan%40icf.com"
      );
    });
  });

  it("does not overwrite the return URL when the user is already on /login", async () => {
    (useOktaAuth as jest.Mock).mockReturnValue({
      authState: { isAuthenticated: false },
    });

    window.history.replaceState({}, "", "/login");

    render(<Router props={{ oktaSignInConfig: {} }} />);

    await waitFor(() => {
      expect(sessionStorage.getItem(MADIE_TIMEOUT_RETURN_URL)).toBeNull();
    });
  });
});
