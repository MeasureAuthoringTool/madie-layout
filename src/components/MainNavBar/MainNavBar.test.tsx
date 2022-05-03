import "@testing-library/jest-dom";

import React from "react";
import { render, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, expect, test } from "@jest/globals";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router";

import { useOktaAuth } from "@okta/okta-react";
import MainNavBar from "./MainNavBar";
import userEvent from "@testing-library/user-event";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;
const responseString = `<!DOCTYPE HTML PUBLIC \"-//IETF//DTD HTML 2.0//EN\"><html><head><title>201 Created</title></head><body><h1>TGT Created</h1><form action="https://utslogin.nlm.nih.gov/cas/v1/api-key/TGT-1037308-xHuHeCAsUcmLdePPfajsIxwxMvbgZYhtDlbGyBtMnZldihebqr-cas" method="POST">Service:<input type="text" name="service" value=""><br><input type="submit" value="Submit"></form></body></html>`;

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

  window.localStorage.removeItem("TGT");
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
    mockedAxios.post.mockResolvedValue({
      status: 201,
      data: responseString,
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
        expect(mockedAxios.post).toHaveBeenCalled(),
          {
            timeout: 5000,
          };
      });
      await waitFor(() => {
        expect(queryByTestId("UMLS-login-success-text")).toBeTruthy();
      });
      setTimeout(() => {
        expect("UMLS-login-success-text").not.toBeInTheDocument();
      }, 5000);

      const tgt = window.localStorage.getItem("TGT");
      let tgtObjFromLocalStorage = JSON.parse(tgt);
      let tgtValue = null;
      for (const [key, value] of Object.entries(tgtObjFromLocalStorage)) {
        if (key === "TGT") {
          tgtValue = value.toString();
        }
      }
      expect(tgtValue).toEqual(
        "TGT-1037308-xHuHeCAsUcmLdePPfajsIxwxMvbgZYhtDlbGyBtMnZldihebqr-cas"
      );
    });
  });

  test("Failing to login produces a danger toast.", async () => {
    mockedAxios.post.mockResolvedValue({
      status: 401,
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
        expect(mockedAxios.post).toHaveBeenCalled(),
          {
            timeout: 5000,
          };
      });
      await waitFor(() => {
        expect(queryByTestId("UMLS-login-generic-error-text")).toBeTruthy();
      });
    });
  });

  test("Failed api requests open the danger dialog, and users can close it", async () => {
    mockedAxios.post.mockResolvedValue(Promise.reject("error failed"));
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
        expect(mockedAxios.post).toHaveBeenCalled(),
          {
            timeout: 5000,
          };
      });
      await waitFor(() => {
        expect(queryByText("error failed")).toBeTruthy();
        fireEvent.keyDown(queryByTestId("UMLS-login-generic-error-text"), {
          key: "Escape",
          code: "Escape",
          keyCode: 27,
          charCode: 27,
        });
      });
      await waitFor(() => {
        expect(queryByText("error failed")).not.toBeInTheDocument();
      });
    });
  });

  test("Should not render UMLSDialog when user has valid TGT", async () => {
    const tgtObj = {
      TGT: "TGT-1037308-xHuHeCAsUcmLdePPfajsIxwxMvbgZYhtDlbGyBtMnZldihebqr-cas",
      tgtTimeStamp: new Date().getTime(),
    };
    window.localStorage.setItem("TGT", JSON.stringify(tgtObj));
    await act(async () => {
      const { findByTestId, queryByTestId, queryByText } = await render(
        <MemoryRouter>
          <MainNavBar />
        </MemoryRouter>
      );
      expect(queryByText("UMLS Active")).toBeInTheDocument();
      expect(queryByText("Connect to UMLS")).not.toBeInTheDocument();
      const dialogButton = await findByTestId("UMLS-connect-button");
      expect(dialogButton).toBeTruthy();
      fireEvent.click(dialogButton);
      const dialog = await queryByTestId("UMLS-connect-form");
      expect(dialog).not.toBeTruthy();
    });
  });

  test("Should render ULMSDialog when TGT is expired", async () => {
    const nowMinus9Hours = new Date();
    nowMinus9Hours.setHours(nowMinus9Hours.getHours() - 9);
    const tgtObj = {
      TGT: "TGT-1037308-xHuHeCAsUcmLdePPfajsIxwxMvbgZYhtDlbGyBtMnZldihebqr-cas",
      tgtTimeStamp: nowMinus9Hours.getTime(),
    };
    window.localStorage.setItem("TGT", JSON.stringify(tgtObj));
    await act(async () => {
      const { findByTestId, queryByTestId, queryByText, getByText } =
        await render(
          <MemoryRouter>
            <MainNavBar />
          </MemoryRouter>
        );

      expect(getByText("Connect to UMLS")).toBeInTheDocument();
      expect(queryByText("UMLS Active")).not.toBeInTheDocument();
      const dialogButton = await findByTestId("UMLS-connect-button");
      expect(dialogButton).toBeTruthy();
      fireEvent.click(dialogButton);
      const dialog = await queryByTestId("UMLS-connect-form");
      expect(dialog).toBeTruthy();
    });
  });
});
