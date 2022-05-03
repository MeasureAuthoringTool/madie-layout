import React from "react";
import {
  fireEvent,
  render,
  waitFor,
  cleanup,
} from "@testing-library/react";
import UserProfile from "./UserProfile";
import { MemoryRouter } from "react-router";
import { useOktaAuth } from "@okta/okta-react";
import { act } from "react-dom/test-utils";

jest.mock("@okta/okta-react", () => ({
  useOktaAuth: jest.fn(),
}));

const mockLogoutLogger = jest.fn((args) => {
  Promise.resolve("logged");
});
jest.mock("../../custom-hooks/customLog", () => {
  //lazy load the mock otherwise will thorw ReferenceError: Cannot access 'mockLogoutLogger' before initialization
  return {
    logoutLogger: (args) => {
      return mockLogoutLogger(args);
    },
  };
});
const MockSignOut = jest.fn().mockImplementation(() => {
  return Promise.resolve();
});

beforeEach(() => {
  const mockGetUserInfo = jest.fn().mockImplementation(() => {
    return Promise.resolve({ name: "test name", given_name: "test" });
  });
  const mockToken = { getUserInfo: mockGetUserInfo };

  (useOktaAuth as jest.Mock).mockImplementation(() => ({
    oktaAuth: {
      token: mockToken,
      signOut: MockSignOut,
    },
    authState: { isAuthenticated: true },
  }));
});
afterEach(cleanup);

describe("UserProfile component", () => {
  test("Should render", async () => {
    await act(async () => {
      const { getByTestId } = await render(
        <MemoryRouter>
          <UserProfile />
        </MemoryRouter>
      );
      expect(getByTestId("user-profile-form")).toBeInTheDocument();
      expect(getByTestId("user-profile-select")).toBeInTheDocument();
    });
  });

  test("Should render user profile dropdown options and allow users to select logout", async () => {
    await act(async () => {
      const { getByTestId } = await render(
        <MemoryRouter>
          <UserProfile />
        </MemoryRouter>
      );
      const userInfoSelect = await getByTestId("user-profile-select");
      fireEvent.click(userInfoSelect);
      const userInputSelect = await getByTestId("user-profile-input");
      fireEvent.select(userInputSelect, { target: { value: "test" } });
      expect(userInputSelect.value).toBe("test");
      fireEvent.blur(getByTestId("user-profile-select"));
      fireEvent.click(userInfoSelect);
      fireEvent.select(userInputSelect, { target: { value: "Logout" } });
      expect(userInputSelect.value).toBe("Logout");
    });
  });

  test("Should render empty user name", async () => {
    const mockGetUserInfo = jest.fn().mockImplementation(() => {
      return Promise.reject("user name null");
    });
    const mockToken = { getUserInfo: mockGetUserInfo };
    const MockSignOut = jest.fn().mockImplementation(() => {
      Promise.resolve();
    });

    (useOktaAuth as jest.Mock).mockImplementation(() => ({
      oktaAuth: {
        token: mockToken,
        signOut: MockSignOut,
      },
      authState: { isAuthenticated: true },
    }));
    await act(async () => {
      const { getByTestId } = await render(
        <MemoryRouter>
          <UserProfile />
        </MemoryRouter>
      );
      const userInfoSelect = await getByTestId("user-profile-select");
      fireEvent.click(userInfoSelect);
      const userInputSelect = await getByTestId("user-profile-input");
      fireEvent.click(userInfoSelect);
      fireEvent.select(userInputSelect, { target: { value: "Logout" } });
      expect(userInputSelect.value).toBe("Logout");
      waitFor(() => expect(mockLogoutLogger).toHaveBeenCalled());
      waitFor(() => expect(MockSignOut).not.toHaveBeenCalled());
    });
  });

  it("Should do logging when user chooses Sign Out", async () => {
    await act(async () => {
      const { getByTestId } = await render(
        <MemoryRouter>
          <UserProfile />
        </MemoryRouter>
      );
      const userInfoSelect = await getByTestId("user-profile-select");
      fireEvent.click(userInfoSelect);
      const userInputSelect = await getByTestId("user-profile-input");
      fireEvent.click(userInfoSelect);
      fireEvent.select(userInputSelect, { target: { value: "Logout" } });
      expect(userInputSelect.value).toBe("Logout");
      waitFor(() => expect(mockLogoutLogger).toHaveBeenCalled());
      waitFor(() => expect(MockSignOut).toHaveBeenCalled());
    });
  });

  test("Should not do logging when user chooses options other than Sign Out", async () => {
    await act(async () => {
      const { getByTestId } = await render(
        <MemoryRouter>
          <UserProfile />
        </MemoryRouter>
      );
      const userInfoSelect = await getByTestId("user-profile-select");
      fireEvent.click(userInfoSelect);
      const userInputSelect = await getByTestId("user-profile-input");
      fireEvent.select(userInputSelect, { target: { value: "test" } });
      expect(userInputSelect.value).toBe("test");
      fireEvent.blur(getByTestId("user-profile-select"));
      waitFor(() => expect(mockLogoutLogger).not.toHaveBeenCalled());
    });
  });
});
