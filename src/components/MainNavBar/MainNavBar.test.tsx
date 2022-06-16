import "@testing-library/jest-dom";

import React from "react";
import {
  render,
  fireEvent,
  waitFor,
  cleanup,
  screen,
} from "@testing-library/react";
import { describe, expect, test } from "@jest/globals";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router";

import { useOktaAuth } from "@okta/okta-react";
import MainNavBar from "./MainNavBar";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import {
  useTerminologyServiceApi,
  TerminologyServiceApi,
} from "@madie/madie-util";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

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
}));

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
describe("UMLS Connection Dialog", () => {
  const mockFormikInfo = {
    apiKey: "mfjdiajenfjgitjeandpsoekrmmanritjehs",
  };
  test("Clicking on UMLS connection button opens a dialog, items are present", async () => {
    await act(async () => {
      const { findByTestId } = await render(
        <MemoryRouter>
          <MainNavBar />
        </MemoryRouter>
      );
      const dialogButton = await findByTestId("UMLS-connect-button");
      expect(dialogButton).toBeTruthy();
      fireEvent.click(dialogButton);
      const dialog = await findByTestId("UMLS-connect-form");
      expect(dialog).toBeTruthy();
      // dialog components
      const instructions = await findByTestId("instruction-list");
      expect(instructions).toBeTruthy();
      const cancelButton = await findByTestId("cancel-UMLS-button");
      expect(cancelButton).toBeTruthy();
      const submitUMLSButton = await findByTestId("submit-UMLS-key");
      expect(submitUMLSButton).toBeTruthy();
      const closeButton = await findByTestId("close-UMLS-dialog-button");
      expect(closeButton).toBeTruthy();
      const textEntry = await findByTestId("UMLS-key-text-field");
      expect(textEntry).toBeTruthy();
    });
  });

  test("Touching and dirtying the form presents validation errors", async () => {
    await act(async () => {
      const { findByTestId, getByTestId } = await render(
        <MemoryRouter>
          <MainNavBar />
        </MemoryRouter>
      );
      const dialogButton = await findByTestId("UMLS-connect-button");
      expect(dialogButton).toBeTruthy();
      fireEvent.click(dialogButton);
      const dialog = await findByTestId("UMLS-connect-form");
      expect(dialog).toBeTruthy();
      // dirty it, produce helper text.
      const UMLSTextNode = await getByTestId("UMLS-key-input");
      expect(UMLSTextNode).toBeTruthy();
      fireEvent.click(UMLSTextNode);
      fireEvent.blur(UMLSTextNode);
      const helperText = await findByTestId("apiKey-helper-text");
      expect(helperText).toBeTruthy();
    });
  });

  test("Succeeding to login produces a success toast.", async () => {
    (useTerminologyServiceApi as jest.Mock).mockImplementation(() => {
      return {
        checkLogin: jest
          .fn()
          .mockRejectedValueOnce({ status: 404, data: false }),
        loginUMLS: jest.fn().mockResolvedValueOnce({
          status: 200,
          data: "success",
        }),
      } as unknown as TerminologyServiceApi;
    });

    await act(async () => {
      const { findByTestId, getByTestId, queryByTestId } = await render(
        <MemoryRouter>
          <MainNavBar />
        </MemoryRouter>
      );
      const dialogButton = await findByTestId("UMLS-connect-button");
      expect(dialogButton).toBeTruthy();
      fireEvent.click(dialogButton);
      const dialog = await findByTestId("UMLS-connect-form");
      expect(dialog).toBeTruthy();

      const UMLSTextNode = await getByTestId("UMLS-key-input");
      fireEvent.click(UMLSTextNode);
      fireEvent.blur(UMLSTextNode);
      userEvent.type(UMLSTextNode, mockFormikInfo.apiKey);
      expect(UMLSTextNode.value).toBe(mockFormikInfo.apiKey);
      const submitButton = await findByTestId("submit-UMLS-key");
      await waitFor(() => expect(submitButton).not.toBeDisabled(), {
        timeout: 5000,
      });
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(queryByTestId("UMLS-login-success-text")).toBeTruthy();
      });
      setTimeout(() => {
        expect("UMLS-login-success-text").not.toBeInTheDocument();
      }, 5000);
    });
  });

  test("Failing to login produces a danger toast.", async () => {
    await act(async () => {
      const { findByTestId, getByTestId, queryByTestId, queryByText } =
        await render(
          <MemoryRouter>
            <MainNavBar />
          </MemoryRouter>
        );
      const dialogButton = await findByTestId("UMLS-connect-button");
      expect(dialogButton).toBeTruthy();
      fireEvent.click(dialogButton);
      const dialog = await findByTestId("UMLS-connect-form");
      expect(dialog).toBeTruthy();

      const UMLSTextNode = await getByTestId("UMLS-key-input");
      fireEvent.click(UMLSTextNode);
      fireEvent.blur(UMLSTextNode);
      userEvent.type(UMLSTextNode, mockFormikInfo.apiKey);
      expect(UMLSTextNode.value).toBe(mockFormikInfo.apiKey);
      const submitButton = await findByTestId("submit-UMLS-key");
      await waitFor(() => expect(submitButton).not.toBeDisabled(), {
        timeout: 5000,
      });
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(queryByTestId("UMLS-login-generic-error-text")).toBeTruthy();
      });
    });
  });

  test("Selecting different navigation routes, provides elements with classes as expected.", async () => {
    await act(async () => {
      const { findByTestId } = await render(
        <MemoryRouter>
          <MainNavBar />
        </MemoryRouter>
      );

      const measuresLink = await findByTestId("main-nav-bar-measures");
      fireEvent.click(measuresLink);
      const measuresLi = await findByTestId("main-nav-bar-measures");
      expect(measuresLi).toHaveClass("active");

      const librariesLink = await findByTestId("main-nav-bar-cql-library");
      fireEvent.click(librariesLink);
      const librariesLI = await findByTestId("main-nav-bar-cql-library");
      expect(librariesLI).toHaveClass("active");

      const help = await findByTestId("main-nav-bar-help");
      fireEvent.click(help);
      const helpLI = await findByTestId("main-nav-bar-help");
      expect(helpLI).toHaveClass("active");
    });
  });

  test("Failed api requests open the danger dialog, and users can close it", async () => {
    (useTerminologyServiceApi as jest.Mock).mockImplementation(() => {
      return {
        checkLogin: jest
          .fn()
          .mockRejectedValueOnce({ status: 404, data: false }),
        loginUMLS: jest.fn().mockRejectedValueOnce({
          status: 400,
          data: "failure",
          error: { message: "error" },
        }),
      } as unknown as TerminologyServiceApi;
    });

    await act(async () => {
      const { findByTestId, getByTestId, queryByTestId, queryByText } =
        await render(
          <MemoryRouter>
            <MainNavBar />
          </MemoryRouter>
        );
      const dialogButton = await findByTestId("UMLS-connect-button");
      expect(dialogButton).toBeTruthy();
      fireEvent.click(dialogButton);
      const dialog = await findByTestId("UMLS-connect-form");
      expect(dialog).toBeTruthy();

      const UMLSTextNode = await getByTestId("UMLS-key-input");
      fireEvent.click(UMLSTextNode);
      fireEvent.blur(UMLSTextNode);
      userEvent.type(UMLSTextNode, mockFormikInfo.apiKey);
      expect(UMLSTextNode.value).toBe(mockFormikInfo.apiKey);
      const submitButton = await findByTestId("submit-UMLS-key");
      await waitFor(() => expect(submitButton).not.toBeDisabled(), {
        timeout: 5000,
      });
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(queryByTestId("UMLS-login-generic-error-text")).toBeTruthy();
        expect(
          queryByText("An unexpected error has ocurred")
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        fireEvent.keyDown(queryByTestId("UMLS-login-generic-error-text"), {
          key: "Escape",
          code: "Escape",
          keyCode: 27,
          charCode: 27,
        });
      });
      await waitFor(() => {
        expect(
          queryByText("An unexpected error has ocurred")
        ).not.toBeInTheDocument();
      });
    });
  });

  test("Should not render UMLSDialog when user has valid TGT", async () => {
    (useTerminologyServiceApi as jest.Mock).mockImplementation(() => {
      return {
        checkLogin: jest.fn().mockResolvedValue({ status: 200, data: true }),
      } as unknown as TerminologyServiceApi;
    });

    await render(
      <MemoryRouter>
        <MainNavBar />
      </MemoryRouter>
    );
    expect(screen.queryByText("UMLS Active")).toBeInTheDocument();
    expect(screen.queryByText("Connect to UMLS")).not.toBeInTheDocument();
    const dialogButton = await screen.findByTestId("UMLS-connect-button");
    expect(dialogButton).toBeTruthy();
    fireEvent.click(dialogButton);
    const dialog = await screen.queryByTestId("UMLS-connect-form");
    expect(dialog).not.toBeTruthy();
  });

  test("Should render UMLSDialog when valid TGT is not found", async () => {
    await act(async () => {
      const { queryByTestId, queryByText, getByText } = await render(
        <MemoryRouter>
          <MainNavBar />
        </MemoryRouter>
      );
      expect(getByText("Connect to UMLS")).toBeInTheDocument();
      expect(queryByText("UMLS Active")).not.toBeInTheDocument();
      const dialogButton = await screen.findByTestId("UMLS-connect-button");
      expect(dialogButton).toBeTruthy();
      fireEvent.click(dialogButton);
      const dialog = await queryByTestId("UMLS-connect-form");
      expect(dialog).toBeTruthy();
    });
  });

  test("Failed api with 401 requests open the danger dialog with custom error message, and users can close it", async () => {
    (useTerminologyServiceApi as jest.Mock).mockImplementation(() => {
      return {
        checkLogin: jest
          .fn()
          .mockRejectedValueOnce({ status: 404, data: false }),
        loginUMLS: jest.fn().mockRejectedValueOnce({
          status: 401,
          data: "failure",
          error: { message: "error" },
        }),
      } as unknown as TerminologyServiceApi;
    });

    await act(async () => {
      const { findByTestId, getByTestId, queryByTestId, queryByText } =
        await render(
          <MemoryRouter>
            <MainNavBar />
          </MemoryRouter>
        );
      const dialogButton = await findByTestId("UMLS-connect-button");
      expect(dialogButton).toBeTruthy();
      fireEvent.click(dialogButton);
      const dialog = await findByTestId("UMLS-connect-form");
      expect(dialog).toBeTruthy();

      const UMLSTextNode = await getByTestId("UMLS-key-input");
      fireEvent.click(UMLSTextNode);
      fireEvent.blur(UMLSTextNode);
      userEvent.type(UMLSTextNode, mockFormikInfo.apiKey);
      expect(UMLSTextNode.value).toBe(mockFormikInfo.apiKey);
      const submitButton = await findByTestId("submit-UMLS-key");
      await waitFor(() => expect(submitButton).not.toBeDisabled(), {
        timeout: 5000,
      });
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(queryByTestId("UMLS-login-generic-error-text")).toBeTruthy();
        expect(
          queryByText("Invalid UMLS Key. Please re-enter a valid UMLS Key.")
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        fireEvent.keyDown(queryByTestId("UMLS-login-generic-error-text"), {
          key: "Escape",
          code: "Escape",
          keyCode: 27,
          charCode: 27,
        });
      });
      await waitFor(() => {
        expect(
          queryByText("Invalid UMLS Key. Please re-enter a valid UMLS Key.")
        ).not.toBeInTheDocument();
      });
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
