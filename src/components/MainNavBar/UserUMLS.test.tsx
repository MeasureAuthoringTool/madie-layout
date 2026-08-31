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
import UserUMLS from "./UserUMLS";
import userEvent from "@testing-library/user-event";
import {
  useTerminologyServiceApi,
  TerminologyServiceApi,
} from "@madie/madie-util";

jest.mock("@okta/okta-react", () => ({
  useOktaAuth: jest.fn(),
}));

jest.mock("@madie/madie-util", () => ({
  useTerminologyServiceApi: jest.fn(),
}));

beforeEach(() => {
  (useOktaAuth as jest.Mock).mockImplementation(() => ({
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

describe("User UMLS Connection", () => {
  const mockFormikInfo = {
    apiKey: "mfjdiajenfjgitjeandpsoekrmmanritjehs",
  };

  test("labels the UMLS dropdown and renders Connect to UMLS without nested list items", async () => {
    render(
      <MemoryRouter>
        <UserUMLS />
      </MemoryRouter>
    );

    const umlsSelect = screen.getByRole("combobox", {
      name: "UMLS Select",
    });
    expect(umlsSelect).not.toHaveAttribute("aria-labelledby");

    fireEvent.mouseDown(umlsSelect);
    const connectOption = await screen.findByRole("option", {
      name: "Connect to UMLS",
    });
    expect(connectOption.querySelector("li")).not.toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(1);

    fireEvent.click(connectOption);
    expect(await screen.findByTestId("UMLS-connect-form")).toBeInTheDocument();
  });

  test("renders UMLS Active and Sign Out without nested list items", async () => {
    (useTerminologyServiceApi as jest.Mock).mockImplementation(() => ({
      checkLogin: jest.fn().mockResolvedValue({ status: 200, data: true }),
    }));

    render(
      <MemoryRouter>
        <UserUMLS />
      </MemoryRouter>
    );

    const umlsSelect = await screen.findByRole("combobox", {
      name: "UMLS Select",
    });
    await waitFor(() => expect(umlsSelect).toHaveTextContent("UMLS Active"));
    fireEvent.mouseDown(umlsSelect);

    expect(
      await screen.findByRole("option", { name: "UMLS Active" })
    ).toHaveAttribute("aria-disabled", "true");
    expect(
      screen.getByRole("option", { name: "Sign Out" })
    ).toBeInTheDocument();
    expect(screen.queryByTestId("UMLS-connect-button")).not.toBeInTheDocument();
    screen
      .getAllByRole("option")
      .forEach((option) =>
        expect(option.querySelector("li")).not.toBeInTheDocument()
      );
  });

  test("Clicking on UMLS connection button opens a dialog, items are present", async () => {
    await act(async () => {
      const { findByTestId } = await render(
        <MemoryRouter>
          <UserUMLS />
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
          <UserUMLS />
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
          <UserUMLS />
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
        timeout: 10000,
      });
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(queryByTestId("UMLS-login-success-text")).toBeTruthy();
      });
      setTimeout(() => {
        expect("UMLS-login-success-text").not.toBeInTheDocument();
      }, 10000);
    });
  });

  test("Failing to login produces a danger toast.", async () => {
    await act(async () => {
      const { findByTestId, getByTestId, queryByTestId, queryByText } =
        await render(
          <MemoryRouter>
            <UserUMLS />
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
            <UserUMLS />
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
        timeout: 6000,
      });
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(queryByTestId("UMLS-login-generic-error-text")).toBeTruthy();
        expect(
          queryByText("An unexpected error has occurred")
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
          queryByText("An unexpected error has occurred")
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
        <UserUMLS />
      </MemoryRouter>
    );
    expect(screen.queryByText("UMLS Active")).toBeInTheDocument();
    expect(screen.queryByText("Connect to UMLS")).not.toBeInTheDocument();
    expect(screen.queryByTestId("UMLS-connect-button")).not.toBeInTheDocument();
    const dialog = await screen.queryByTestId("UMLS-connect-form");
    expect(dialog).not.toBeTruthy();
  });

  test("Should render UMLSDialog when valid TGT is not found", async () => {
    await act(async () => {
      const { queryByTestId, queryByText, getByText } = await render(
        <MemoryRouter>
          <UserUMLS />
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
            <UserUMLS />
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
        timeout: 8000,
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

  test("Should display reminder login failed toast when use is not logged in UMLS", async () => {
    (useTerminologyServiceApi as jest.Mock).mockImplementation(() => {
      return {
        checkLogin: jest
          .fn()
          .mockRejectedValueOnce({ status: 404, data: false }),
      } as unknown as TerminologyServiceApi;
    });
    await act(async () => {
      const { queryByText } = await render(
        <MemoryRouter>
          <UserUMLS />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(queryByText("Please sign in to UMLS.")).toBeInTheDocument();
      });
    });
  });

  test("When user is not authenticated, Connect to UMLS displays", async () => {
    (useOktaAuth as jest.Mock).mockImplementation(() => ({
      authState: { isAuthenticated: false },
    }));

    await act(async () => {
      const { queryByText } = await render(
        <MemoryRouter>
          <UserUMLS />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(queryByText("Connect to UMLS")).toBeInTheDocument();
      });
    });
  });

  test("Clicking on UMLS logout button opens confirmation dialog", async () => {
    (useTerminologyServiceApi as jest.Mock).mockImplementation(() => {
      return {
        checkLogin: jest
          .fn()
          .mockResolvedValueOnce({ status: 200, data: true }),
      } as unknown as TerminologyServiceApi;
    });

    await act(async () => {
      const { getByTestId } = await render(
        <MemoryRouter>
          <UserUMLS />
        </MemoryRouter>
      );
      const userInfoSelect = await getByTestId("user-umls-select");
      fireEvent.click(userInfoSelect);
      const userInputSelect = await getByTestId("user-umls-input");
      fireEvent.change(userInputSelect, { target: { value: "LogoutUMLS" } });
      fireEvent.blur(getByTestId("user-umls-select"));
      expect(getByTestId("confirm-dialog")).toBeInTheDocument();
    });
  });

  test("Clicking on UMLS logout confirmation button logs out umls", async () => {
    (useTerminologyServiceApi as jest.Mock).mockImplementation(() => {
      return {
        checkLogin: jest
          .fn()
          .mockResolvedValueOnce({ status: 200, data: true }),
        logoutUMLS: jest
          .fn()
          .mockResolvedValueOnce({ status: 200, data: true }),
      } as unknown as TerminologyServiceApi;
    });

    await act(async () => {
      const { getByTestId } = await render(
        <MemoryRouter>
          <UserUMLS />
        </MemoryRouter>
      );
      const userInfoSelect = await getByTestId("user-umls-select");
      fireEvent.click(userInfoSelect);
      const userInputSelect = await getByTestId("user-umls-input");
      fireEvent.change(userInputSelect, { target: { value: "LogoutUMLS" } });
      fireEvent.blur(getByTestId("user-umls-select"));
      expect(getByTestId("confirm-dialog")).toBeInTheDocument();
      const continueBtn = getByTestId("confirm-dialog-continue-button");
      expect(continueBtn).toBeInTheDocument();

      fireEvent.click(continueBtn);
      waitFor(() => expect(mockSignout).toHaveBeenCalled());
    });
    waitFor(() => {
      expect(screen.getByText("Connect to UMLS")).toBeInTheDocument();
    });
  });

  test("Clicking on UMLS logout cancel button does not log out umls", async () => {
    (useTerminologyServiceApi as jest.Mock).mockImplementation(() => {
      return {
        checkLogin: jest
          .fn()
          .mockResolvedValueOnce({ status: 200, data: true }),
      } as unknown as TerminologyServiceApi;
    });

    await act(async () => {
      const { getByTestId } = await render(
        <MemoryRouter>
          <UserUMLS />
        </MemoryRouter>
      );
      const userInfoSelect = await getByTestId("user-umls-select");
      fireEvent.click(userInfoSelect);
      const userInputSelect = await getByTestId("user-umls-input");
      fireEvent.change(userInputSelect, { target: { value: "LogoutUMLS" } });
      fireEvent.blur(getByTestId("user-umls-select"));
      expect(getByTestId("confirm-dialog")).toBeInTheDocument();
      const cancelBtn = getByTestId("confirm-dialog-cancel-button");
      expect(cancelBtn).toBeInTheDocument();

      fireEvent.click(cancelBtn);
    });
    waitFor(() => {
      expect(screen.getByText("UMLS Active")).toBeInTheDocument();
    });
  });

  test("Clicking on UMLS logout confirmation button does not log out umls when there is error", async () => {
    (useTerminologyServiceApi as jest.Mock).mockImplementation(() => {
      return {
        checkLogin: jest
          .fn()
          .mockResolvedValueOnce({ status: 200, data: true }),
        logoutUMLS: jest
          .fn()
          .mockRejectedValueOnce({ status: 400, data: false }),
      } as unknown as TerminologyServiceApi;
    });

    await act(async () => {
      const { getByTestId } = await render(
        <MemoryRouter>
          <UserUMLS />
        </MemoryRouter>
      );
      const userInfoSelect = await getByTestId("user-umls-select");
      fireEvent.click(userInfoSelect);
      const userInputSelect = await getByTestId("user-umls-input");
      fireEvent.change(userInputSelect, { target: { value: "LogoutUMLS" } });
      fireEvent.blur(getByTestId("user-umls-select"));
      expect(getByTestId("confirm-dialog")).toBeInTheDocument();
      const continueBtn = getByTestId("confirm-dialog-continue-button");
      expect(continueBtn).toBeInTheDocument();

      fireEvent.click(continueBtn);
      waitFor(() => expect(mockSignout).toHaveBeenCalled());
    });
    waitFor(() => {
      expect(screen.getByText("UMLS Active")).toBeInTheDocument();
    });
  });
});
