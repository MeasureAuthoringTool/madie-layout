import "@testing-library/jest-dom";

import React from "react";
import { render, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, expect, test } from "@jest/globals";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router";

import { useOktaAuth } from "@okta/okta-react";
import MainNavBar from "./MainNavBar";
import {
  useMeasureServiceApi,
  useCqlLibraryServiceApi,
  useTerminologyServiceApi,
  TerminologyServiceApi,
} from "@madie/madie-util";

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

jest.mock("@madie/madie-util", () => ({
  useTerminologyServiceApi: jest.fn(),
  useMeasureServiceApi: jest.fn(),
  useCqlLibraryServiceApi: jest.fn(),
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
  const mockGetUserInfo = jest.fn().mockImplementation(() => {
    return Promise.resolve({ name: "test name", given_name: "test" });
  });
  const mockToken = { getUserInfo: mockGetUserInfo };
  const mockRenewToken = jest.fn().mockResolvedValue(() => null);

  (useOktaAuth as jest.Mock).mockImplementation(() => ({
    oktaAuth: {
      token: mockToken,
      signOut: MockSignOut,
      tokenManager: {
        renew: mockRenewToken,
      },
    },
    authState: { isAuthenticated: true },
  }));

  (useTerminologyServiceApi as jest.Mock).mockImplementation(() => {
    return {
      checkLogin: jest.fn().mockRejectedValueOnce({ status: 404, data: false }),
      loginUMLS: jest.fn().mockRejectedValueOnce({
        status: 404,
        data: "failure",
        error: { message: "error" },
      }),
    } as unknown as TerminologyServiceApi;
  });
});
afterEach(cleanup);
describe("MainNavBar Component", () => {
  test("Selecting different navigation routes, provides elements with classes as expected.", async () => {
    await act(async () => {
      const { findByTestId } = await render(
        <MemoryRouter>
          <MainNavBar />
        </MemoryRouter>
      );

      const measuresLink = await findByTestId("main-nav-bar-measures");
      act(() => {
        fireEvent.click(measuresLink);
      });
      await waitFor(() => {
        expect(measuresLink).toHaveAttribute("aria-selected", "true");
      });
      const librariesLink = await findByTestId("main-nav-bar-cql-library");
      act(() => {
        fireEvent.click(librariesLink);
      });
      await waitFor(() => {
        expect(librariesLink).toHaveAttribute("aria-selected", "true");
      });
    });
  });

  test("Navigation routes are not available when user is not authenticated", async () => {
    (useOktaAuth as jest.Mock).mockImplementation(() => ({
      oktaAuth: {
        signOut: MockSignOut,
      },
      authState: { isAuthenticated: false },
    }));
    await act(async () => {
      const { queryByText } = await render(
        <MemoryRouter>
          <MainNavBar />
        </MemoryRouter>
      );

      const measuresLink = await queryByText("main-nav-bar-measures");
      expect(measuresLink).not.toBeInTheDocument();

      const librariesLink = await queryByText("main-nav-bar-cql-library");
      expect(librariesLink).not.toBeInTheDocument();

      const help = await queryByText("main-nav-bar-help");
      expect(help).not.toBeInTheDocument();

      expect(queryByText("UMLS Active")).not.toBeInTheDocument();
      expect(queryByText("Connect to UMLS")).not.toBeInTheDocument();
    });
  });
});
