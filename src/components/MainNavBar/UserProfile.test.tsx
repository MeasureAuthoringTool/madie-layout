import React from "react";
import { fireEvent, render, waitFor, cleanup } from "@testing-library/react";
import UserProfile from "./UserProfile";
import { MemoryRouter } from "react-router";
import { useOktaAuth } from "@okta/okta-react";
import { act } from "react-dom/test-utils";
import { clearTimeoutReturnUrl } from "../../services/timeoutReturnUrl";
import { performLogoutCleanup } from "../../services/logoutCleanup";

jest.mock("@okta/okta-react", () => ({
  useOktaAuth: jest.fn(),
}));

jest.mock("../../services/timeoutReturnUrl", () => ({
  clearTimeoutReturnUrl: jest.fn(),
}));

jest.mock("../../services/logoutCleanup", () => ({
  performLogoutCleanup: jest.fn().mockResolvedValue(undefined),
}));

const mockLogoutLog = jest.fn().mockResolvedValue({});
const mockUnlockMeasures = jest.fn().mockResolvedValue({});
const mockUnlockLibraries = jest.fn().mockResolvedValue({});
const mockSignOut = jest.fn().mockResolvedValue(undefined);

jest.mock("@madie/madie-util", () => ({
  useMeasureServiceApi: jest.fn(() => ({
    unlockMeasures: mockUnlockMeasures,
  })),
  useCqlLibraryServiceApi: jest.fn(() => ({
    unlockLibraries: mockUnlockLibraries,
  })),
  useUserServiceApi: jest.fn(() => ({
    logoutLog: mockLogoutLog,
  })),
  getServiceConfig: () => ({
    measureService: {
      baseUrl: "example-service-url",
    },
    cqlLibraryService: {
      baseUrl: "test-cql-library-service-url",
    },
  }),
  useServiceConfig: () => ({
    measureService: {
      baseUrl: "example-service-url",
    },
    cqlLibraryService: {
      baseUrl: "test-cql-library-service-url",
      fetchAllOwners: jest.fn().mockResolvedValue(["owner1", "owner2"]),
    },
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockLogoutLog.mockResolvedValue({});
  mockUnlockMeasures.mockResolvedValue({});
  mockUnlockLibraries.mockResolvedValue({});
  (clearTimeoutReturnUrl as jest.Mock).mockClear();

  const mockGetUserInfo = jest.fn().mockResolvedValue({
    name: "test name",
    given_name: "test",
  });
  const mockAccessToken = { value: "test-access-token" };

  (useOktaAuth as jest.Mock).mockImplementation(() => ({
    oktaAuth: {
      token: { getUserInfo: mockGetUserInfo },
      tokenManager: {
        getTokens: jest
          .fn()
          .mockResolvedValue({ accessToken: mockAccessToken }),
      },
      signOut: mockSignOut,
    },
    authState: { isAuthenticated: true },
  }));
});

afterEach(cleanup);

describe("UserProfile component", () => {
  test("Should render", async () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );

    expect(getByTestId("user-profile-form")).toBeInTheDocument();
    expect(getByTestId("user-profile-select")).toBeInTheDocument();
  });

  test("labels the profile dropdown without aria-labelledby", async () => {
    const { findByRole } = render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );

    const profileSelect = await findByRole("combobox", {
      name: "Profile Select",
    });
    expect(profileSelect).not.toHaveAttribute("aria-labelledby");
  });

  test("Should render user profile dropdown options and allow users to select logout", async () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );

    const userInputSelect = getByTestId("user-profile-input");
    fireEvent.change(userInputSelect, { target: { value: "Logout" } });

    await waitFor(() => expect(mockLogoutLog).toHaveBeenCalled());
    await waitFor(() => expect(clearTimeoutReturnUrl).toHaveBeenCalled());
    await waitFor(() => expect(performLogoutCleanup).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockSignOut).toHaveBeenCalledTimes(1));
  });

  test("Should render empty user name", async () => {
    const mockGetUserInfo = jest
      .fn()
      .mockRejectedValue(new Error("user name null"));
    (useOktaAuth as jest.Mock).mockImplementation(() => ({
      oktaAuth: {
        token: { getUserInfo: mockGetUserInfo },
        tokenManager: {
          getTokens: jest
            .fn()
            .mockResolvedValue({ accessToken: { value: "token" } }),
        },
        signOut: mockSignOut,
      },
      authState: { isAuthenticated: true },
    }));

    const { getByTestId } = render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );

    expect(getByTestId("user-profile-form")).toBeInTheDocument();
    expect(getByTestId("user-profile-input")).toBeInTheDocument();
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it("Should do logging when user chooses Sign Out", async () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );

    const userInputSelect = getByTestId("user-profile-input");
    fireEvent.change(userInputSelect, { target: { value: "Logout" } });

    await waitFor(() => expect(mockLogoutLog).toHaveBeenCalled());
    await waitFor(() => expect(performLogoutCleanup).toHaveBeenCalled());
    await waitFor(() => expect(mockSignOut).toHaveBeenCalled());
  });

  test("Should not do logging when user chooses options other than Sign Out", async () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );

    const userInputSelect = getByTestId("user-profile-input");
    fireEvent.change(userInputSelect, { target: { value: "test" } });

    await waitFor(() => expect(mockLogoutLog).not.toHaveBeenCalled());
    await waitFor(() => expect(performLogoutCleanup).not.toHaveBeenCalled());
    await waitFor(() => expect(mockSignOut).not.toHaveBeenCalled());
  });

  it("clears timeout return URL when user manually signs out", async () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );

    const userInputSelect = getByTestId("user-profile-input");
    fireEvent.change(userInputSelect, { target: { value: "Logout" } });

    await waitFor(() => expect(clearTimeoutReturnUrl).toHaveBeenCalled());
    await waitFor(() => expect(mockSignOut).toHaveBeenCalled());
  });
});
