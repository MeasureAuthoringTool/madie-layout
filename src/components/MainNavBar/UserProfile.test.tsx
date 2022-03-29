import React from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  cleanup,
} from "@testing-library/react";
import UserProfile from "./UserProfile";
import { MemoryRouter } from "react-router";
import { useOktaAuth } from "@okta/okta-react";
import userEvent from "@testing-library/user-event";
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
  it("Should render user profile dropdown", async () => {
    render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );

    expect(screen.getByTestId("user-profile-form")).toBeInTheDocument();
    expect(screen.getByTestId("user-profile-select")).toBeInTheDocument();

    expect(
      screen.getByTestId("user-profile-username-option")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("user-profile-username-option").outerHTML
    ).toContain("test");
    expect(
      screen.getByTestId("user-profile-manage-access-option")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("user-profile-logout-option")
    ).toBeInTheDocument();
  });

  it("Should render user profile dropdown options", () => {
    render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );

    userEvent.selectOptions(
      screen.getByTestId("user-profile-select"),
      screen.getByRole("option", { name: "Sign Out" })
    );
    expect(screen.getByRole("option", { name: "Sign Out" }).selected).toBe(
      false
    );
  });

  it("Should do logging when user chooses Sign Out", () => {
    render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );

    userEvent.selectOptions(
      screen.getByTestId("user-profile-select"),
      screen.getByRole("option", { name: "Sign Out" })
    );
    expect(screen.getByRole("option", { name: "Sign Out" }).selected).toBe(
      false
    );

    const option = screen.getByTestId("user-profile-select");
    fireEvent.change(option, { target: { value: "Logout" } });
    waitFor(() => expect(mockLogoutLogger).toHaveBeenCalled());
    waitFor(() => expect(MockSignOut).toHaveBeenCalled());
  });

  it("Should not do logging when user chooses options other than Sign Out", () => {
    render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );

    userEvent.selectOptions(
      screen.getByTestId("user-profile-select"),
      screen.getByRole("option", { name: "Manage Access" })
    );
    expect(screen.getByRole("option", { name: "Manage Access" }).selected).toBe(
      false
    );

    const option = screen.getByTestId("user-profile-select");
    fireEvent.change(option, { target: { value: "ManageAccess" } });
    waitFor(() => expect(mockLogoutLogger).not.toHaveBeenCalled());
  });
});
