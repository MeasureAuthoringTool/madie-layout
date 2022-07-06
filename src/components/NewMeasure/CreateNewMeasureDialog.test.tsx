import "@testing-library/jest-dom";
// NOTE: jest-dom adds handy assertions to Jest and is recommended, but not required

import * as React from "react";
import {
  render,
  fireEvent,
  waitFor,
  within,
  screen,
} from "@testing-library/react";
import { act, Simulate } from "react-dom/test-utils";
import { describe, expect, test } from "@jest/globals";
import userEvent from "@testing-library/user-event";
import CreateNewMeasureDialog from "./CreateNewMeasureDialog";

jest.mock("@madie/madie-util", () => ({
  useOktaTokens: () => ({
    getAccessToken: () => "test.jwt",
    getUserName: () => "TestUser@example.com", //#nosec
  }),
  measureStore: {
    state: null,
    initialState: null,
    updateMeasure: (measure) => measure,
  },
}));

const mockFormikInfo = {
  measureName: "myMeasure",
  model: "QI-Core",
  cqlLibraryName: "myLibrary",
  measureScoring: "Cohort",
  measurementPeriodStart: "01/05/2022",
  measurementPeriodEnd: "03/07/2022",
};

describe("Measures Create Dialog", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Checking for all the items in the measure creation form", async () => {
    await act(async () => {
      const { findByTestId } = await render(
        <CreateNewMeasureDialog open={true} onClose={undefined} />
      );
      expect(await findByTestId("measure-name-text-field")).toBeInTheDocument();
      expect(await findByTestId("measure-model-select")).toBeInTheDocument();
      expect(await findByTestId("model-version-select")).toBeInTheDocument();
      expect(await findByTestId("cql-library-name")).toBeInTheDocument();
      expect(await findByTestId("eqcm-text-field")).toBeInTheDocument();
      expect(await findByTestId("subject-select")).toBeInTheDocument();
      expect(
        await findByTestId("create-new-measure-save-button")
      ).toBeInTheDocument();

      const cancelButton = await findByTestId(
        "create-new-measure-cancel-button"
      );
      expect(cancelButton).toBeInTheDocument();
      expect(cancelButton).toBeEnabled();

      const submitButton = await findByTestId("create-new-measure-save-button");
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      const measurementPeriodEndNode = await findByTestId(
        "measurement-period-end"
      );
      const measurementPeriodEndInput = within(
        measurementPeriodEndNode
      ).getByRole("textbox");
      userEvent.type(
        measurementPeriodEndInput,
        mockFormikInfo.measurementPeriodEnd
      );
      expect(measurementPeriodEndInput.value).toBe(
        mockFormikInfo.measurementPeriodEnd
      );
    });
  });

  test("to check if all given inputs are as expected", async () => {
    await act(async () => {
      const { queryByTestId, getByTestId } = await render(
        <CreateNewMeasureDialog open={true} onClose={undefined} />
      );

      const nameNode = await getByTestId("measure-name-input");
      userEvent.type(nameNode, mockFormikInfo.measureName);
      expect(nameNode.value).toBe(mockFormikInfo.measureName);
      Simulate.change(nameNode);

      const libraryNode = await getByTestId("cql-library-name-input");
      userEvent.type(libraryNode, mockFormikInfo.cqlLibraryName);
      expect(libraryNode.value).toBe(mockFormikInfo.cqlLibraryName);
      Simulate.change(libraryNode);

      const modelSelect = await getByTestId("measure-model-select");
      fireEvent.click(modelSelect);
      const modelNode = await getByTestId("measure-model-input");
      fireEvent.select(modelNode, { target: { value: mockFormikInfo.model } });
      expect(modelNode.value).toBe(mockFormikInfo.model);
      Simulate.change(modelNode);

      const measurementPeriodStartNode = getByTestId(
        "measurement-period-start"
      );
      const measurementPeriodStartInput = within(
        measurementPeriodStartNode
      ).getByRole("textbox");
      userEvent.type(
        measurementPeriodStartInput,
        mockFormikInfo.measurementPeriodStart
      );
      expect(measurementPeriodStartInput.value).toBe(
        mockFormikInfo.measurementPeriodStart
      );

      const measurementPeriodEndNode = getByTestId("measurement-period-end");
      const measurementPeriodEndInput = within(
        measurementPeriodEndNode
      ).getByRole("textbox");
      userEvent.type(
        measurementPeriodEndInput,
        mockFormikInfo.measurementPeriodEnd
      );
      expect(measurementPeriodEndInput.value).toBe(
        mockFormikInfo.measurementPeriodEnd
      );

      const submitButton = await getByTestId("create-new-measure-save-button");
      await waitFor(() => expect(submitButton).not.toBeDisabled(), {
        timeout: 5000,
      });
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(queryByTestId("server-error-alerts")).not.toBeInTheDocument();
      });
    });
  }, 20000);

  test("checking if error text is displayed for invalid dates", async () => {
    await act(async () => {
      await render(<CreateNewMeasureDialog open={true} onClose={undefined} />);

      const measurementPeriodStartNode = screen.getByTestId(
        "measurement-period-start"
      );
      const measurementPeriodStartInput = within(
        measurementPeriodStartNode
      ).getByRole("textbox");
      userEvent.type(measurementPeriodStartInput, "12/33");

      const measurementPeriodEndNode = screen.getByTestId(
        "measurement-period-end"
      );
      const measurementPeriodEndInput = within(
        measurementPeriodEndNode
      ).getByRole("textbox");
      userEvent.type(
        measurementPeriodEndInput,
        mockFormikInfo.measurementPeriodEnd
      );

      expect(measurementPeriodEndInput.value).toBe(
        mockFormikInfo.measurementPeriodEnd
      );

      fireEvent.click(measurementPeriodStartNode);
      await waitFor(() => {
        expect(
          screen.getByTestId("measurementPeriodStart-helper-text")
        ).not.toBe(null);
        expect(
          screen.getByTestId("measurementPeriodStart-helper-text")
        ).toHaveTextContent("Invalid date format. (mm/dd/yyyy)");
      });

      const submitButton = await screen.getByTestId(
        "create-new-measure-save-button"
      );
      await waitFor(() => expect(submitButton).toBeDisabled(), {
        timeout: 3000,
      });
    });
  }, 20000);

  test("checking if error text is displayed when measurement periods are not provided", async () => {
    await act(async () => {
      await render(<CreateNewMeasureDialog open={true} onClose={undefined} />);

      const measurementPeriodStartNode = screen.getByTestId(
        "measurement-period-start"
      );
      const measurementPeriodStartInput = within(
        measurementPeriodStartNode
      ).getByRole("textbox");
      userEvent.type(measurementPeriodStartInput, "");

      const measurementPeriodEndNode = screen.getByTestId(
        "measurement-period-end"
      );
      const measurementPeriodEndInput = within(
        measurementPeriodEndNode
      ).getByRole("textbox");
      userEvent.type(
        measurementPeriodEndInput,
        mockFormikInfo.measurementPeriodEnd
      );

      expect(measurementPeriodEndInput.value).toBe(
        mockFormikInfo.measurementPeriodEnd
      );

      fireEvent.click(measurementPeriodStartNode);
      await waitFor(() => {
        expect(
          screen.getByTestId("measurementPeriodStart-helper-text")
        ).not.toBe(null);
        expect(
          screen.getByTestId("measurementPeriodStart-helper-text")
        ).toHaveTextContent("Measurement period start date is required");
      });

      const submitButton = await screen.getByTestId(
        "create-new-measure-save-button"
      );
      await waitFor(() => expect(submitButton).toBeDisabled(), {
        timeout: 3000,
      });
    });
  }, 20000);

  test("checking if error text is displayed when measurement periods are not between the years 1900 and 2100", async () => {
    await act(async () => {
      await render(<CreateNewMeasureDialog open={true} onClose={undefined} />);

      const measurementPeriodStartNode = screen.getByTestId(
        "measurement-period-start"
      );
      const measurementPeriodStartInput = within(
        measurementPeriodStartNode
      ).getByRole("textbox");
      userEvent.type(measurementPeriodStartInput, "12/22/2100");

      const measurementPeriodEndNode = screen.getByTestId(
        "measurement-period-end"
      );
      const measurementPeriodEndInput = within(
        measurementPeriodEndNode
      ).getByRole("textbox");
      userEvent.type(
        measurementPeriodEndInput,
        mockFormikInfo.measurementPeriodEnd
      );

      expect(measurementPeriodEndInput.value).toBe(
        mockFormikInfo.measurementPeriodEnd
      );

      fireEvent.click(measurementPeriodStartNode);
      await waitFor(() => {
        expect(
          screen.getByTestId("measurementPeriodStart-helper-text")
        ).not.toBe(null);
        expect(
          screen.getByTestId("measurementPeriodStart-helper-text")
        ).toHaveTextContent(
          "Start date should be between the years 1900 and 2099"
        );
      });

      const submitButton = await screen.getByTestId(
        "create-new-measure-save-button"
      );
      await waitFor(() => expect(submitButton).toBeDisabled(), {
        timeout: 3000,
      });
    });
  }, 20000);
});
