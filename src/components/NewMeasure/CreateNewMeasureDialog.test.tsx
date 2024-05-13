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
import userEvent from "@testing-library/user-event";
import CreateNewMeasureDialog from "./CreateNewMeasureDialog";
import { useFeatureFlags } from "@madie/madie-util";

jest.mock("@madie/madie-util", () => ({
  useOktaTokens: () => ({
    getAccessToken: () => "test.jwt",
  }),
  measureStore: {
    state: null,
    initialState: null,
    updateMeasure: (measure) => measure,
  },
  useFeatureFlags: jest.fn().mockReturnValue({}),
}));

const formikInfo = {
  measureName: "myMeasure",
  model: "QI-Core",
  cqlLibraryName: "myLibrary",
  ecqmTitle: "ecqmTitle",
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
      expect(await findByTestId("cql-library-name")).toBeInTheDocument();
      expect(await findByTestId("ecqm-text-field")).toBeInTheDocument();
      expect(await findByTestId("continue-button")).toBeInTheDocument();

      const cancelButton = await findByTestId(
        "create-new-measure-cancel-button"
      );
      expect(cancelButton).toBeInTheDocument();
      expect(cancelButton).toBeEnabled();

      const submitButton = await findByTestId("continue-button");
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
        formikInfo.measurementPeriodEnd
      );
      expect(measurementPeriodEndInput.value).toBe(
        formikInfo.measurementPeriodEnd
      );
    });
  });

  test("to check if all given inputs are as expected", async () => {
    await act(async () => {
      const { queryByTestId, getByTestId } = await render(
        <CreateNewMeasureDialog open={true} onClose={undefined} />
      );

      const nameNode = await getByTestId("measure-name-input");
      userEvent.type(nameNode, formikInfo.measureName);
      expect(nameNode.value).toBe(formikInfo.measureName);
      Simulate.change(nameNode);

      const libraryNode = await getByTestId("cql-library-name-input");
      userEvent.type(libraryNode, formikInfo.cqlLibraryName);
      expect(libraryNode.value).toBe(formikInfo.cqlLibraryName);
      Simulate.change(libraryNode);

      const ecqmNode = await getByTestId("ecqm-input");
      userEvent.type(ecqmNode, formikInfo.ecqmTitle);
      expect(ecqmNode.value).toBe(formikInfo.ecqmTitle);
      Simulate.change(ecqmNode);

      const modelSelect = await getByTestId("measure-model-select");
      fireEvent.click(modelSelect);
      const modelNode = await getByTestId("measure-model-input");
      fireEvent.select(modelNode, { target: { value: formikInfo.model } });
      expect(modelNode.value).toBe(formikInfo.model);
      Simulate.change(modelNode);

      const measurementPeriodStartNode = getByTestId(
        "measurement-period-start"
      );
      const measurementPeriodStartInput = within(
        measurementPeriodStartNode
      ).getByRole("textbox");
      userEvent.type(
        measurementPeriodStartInput,
        formikInfo.measurementPeriodStart
      );
      expect(measurementPeriodStartInput.value).toBe(
        formikInfo.measurementPeriodStart
      );

      const measurementPeriodEndNode = getByTestId("measurement-period-end");
      const measurementPeriodEndInput = within(
        measurementPeriodEndNode
      ).getByRole("textbox");
      userEvent.type(
        measurementPeriodEndInput,
        formikInfo.measurementPeriodEnd
      );
      expect(measurementPeriodEndInput.value).toBe(
        formikInfo.measurementPeriodEnd
      );

      const submitButton = await getByTestId("continue-button");
      expect(submitButton).not.toBeDisabled();
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(queryByTestId("server-error-alerts")).not.toBeInTheDocument();
      });
    });
  });

  test("the dialog allows create for a QDM measure with underscore in library name", async () => {
    (useFeatureFlags as jest.Mock).mockReturnValue({ qdm: true });
    const { queryByTestId, getByTestId } = await render(
      <CreateNewMeasureDialog open={true} onClose={undefined} />
    );

    const nameNode = (await getByTestId(
      "measure-name-input"
    )) as HTMLInputElement;
    userEvent.type(nameNode, "QdmMeasure");
    expect(nameNode.value).toBe("QdmMeasure");

    const libraryNode = (await getByTestId(
      "cql-library-name-input"
    )) as HTMLInputElement;
    userEvent.type(libraryNode, "Qdm_MeasureLib");
    expect(libraryNode.value).toBe("Qdm_MeasureLib");

    const ecqmNode = (await getByTestId("ecqm-input")) as HTMLInputElement;
    userEvent.type(ecqmNode, "ecqmTitleQdm");
    expect(ecqmNode.value).toBe("ecqmTitleQdm");

    const modelSelect = await getByTestId("measure-model-select");
    const modelSelectBtn = await within(modelSelect).getByRole("button");
    userEvent.click(modelSelectBtn);
    const options = await screen.findAllByRole("option");
    expect(options.length).toEqual(2);
    userEvent.click(options[1]);

    const measurementPeriodStartNode = getByTestId("measurement-period-start");
    const measurementPeriodStartInput = within(
      measurementPeriodStartNode
    ).getByRole("textbox") as HTMLInputElement;
    userEvent.type(
      measurementPeriodStartInput,
      formikInfo.measurementPeriodStart
    );
    expect(measurementPeriodStartInput.value).toBe(
      formikInfo.measurementPeriodStart
    );

    const measurementPeriodEndNode = getByTestId("measurement-period-end");
    const measurementPeriodEndInput = within(
      measurementPeriodEndNode
    ).getByRole("textbox") as HTMLInputElement;
    userEvent.type(measurementPeriodEndInput, formikInfo.measurementPeriodEnd);
    expect(measurementPeriodEndInput.value).toBe(
      formikInfo.measurementPeriodEnd
    );

    const submitButton = await getByTestId("continue-button");
    await waitFor(() => expect(submitButton).not.toBeDisabled());
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(queryByTestId("server-error-alerts")).not.toBeInTheDocument();
    });
  }, 10000);

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
        formikInfo.measurementPeriodEnd
      );

      expect(measurementPeriodEndInput.value).toBe(
        formikInfo.measurementPeriodEnd
      );

      fireEvent.click(measurementPeriodStartNode);
      await waitFor(() => {
        expect(
          screen.getByTestId("create-measure-period-start-helper-text")
        ).not.toBe(null);
        expect(
          screen.getByTestId("create-measure-period-start-helper-text")
        ).toHaveTextContent("Invalid date format. (mm/dd/yyyy)");
      });

      expect(screen.getByTestId("continue-button")).toBeDisabled();
    });
  });

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
        formikInfo.measurementPeriodEnd
      );

      expect(measurementPeriodEndInput.value).toBe(
        formikInfo.measurementPeriodEnd
      );

      fireEvent.click(measurementPeriodStartNode);
      await waitFor(() => {
        expect(
          screen.getByTestId("create-measure-period-start-helper-text")
        ).not.toBe(null);
        expect(
          screen.getByTestId("create-measure-period-start-helper-text")
        ).toHaveTextContent("Measurement period start date is required");
      });

      expect(screen.getByTestId("continue-button")).toBeDisabled();
    });
  });

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
        formikInfo.measurementPeriodEnd
      );

      expect(measurementPeriodEndInput.value).toBe(
        formikInfo.measurementPeriodEnd
      );

      fireEvent.click(measurementPeriodStartNode);
      await waitFor(() => {
        expect(
          screen.getByTestId("create-measure-period-start-helper-text")
        ).not.toBe(null);
        expect(
          screen.getByTestId("create-measure-period-start-helper-text")
        ).toHaveTextContent(
          "Start date should be between the years 1900 and 2099"
        );
        expect(screen.getByTestId("continue-button")).toBeDisabled();
      });
    });
  });

  test("checking if error text is displayed when measurement periods end date is before or equal to start date", async () => {
    const { getByTestId } = render(
      <CreateNewMeasureDialog open={true} onClose={undefined} />
    );
    const measurementPeriodStartNode = getByTestId("measurement-period-start");
    const measurementPeriodStartInput = within(
      measurementPeriodStartNode
    ).getByRole("textbox");
    userEvent.type(measurementPeriodStartInput, "12/12/2022");

    const measurementPeriodEndNode = getByTestId("measurement-period-end");
    const measurementPeriodEndInput = within(
      measurementPeriodEndNode
    ).getByRole("textbox");
    userEvent.type(measurementPeriodEndInput, "12/12/2021");

    userEvent.click(getByTestId("dialog-form"));
    await waitFor(() => {
      expect(
        getByTestId("create-measure-period-end-helper-text")
      ).toBeInTheDocument();
      expect(
        getByTestId("create-measure-period-end-helper-text")
      ).toHaveTextContent(
        "Measurement period end date should be greater than measurement period start date."
      );
      expect(getByTestId("continue-button")).toBeDisabled();
    });

    userEvent.type(measurementPeriodStartInput, "12/12/2022");
    userEvent.type(measurementPeriodEndInput, "12/12/2022");
    userEvent.click(getByTestId("dialog-form"));
    userEvent.click(getByTestId("dialog-form"));
    await waitFor(() => {
      expect(
        screen.getByTestId("create-measure-period-end-helper-text")
      ).toBeInTheDocument();
      expect(
        getByTestId("create-measure-period-end-helper-text")
      ).toHaveTextContent(
        "Measurement period end date should be greater than measurement period start date."
      );
      expect(getByTestId("continue-button")).toBeDisabled();
    });
  });

  test("the dialog does not allow create for a QI-Core measure with underscore in library name", async () => {
    (useFeatureFlags as jest.Mock).mockReturnValue({ qdm: true });
    const { queryByTestId, getByTestId } = await render(
      <CreateNewMeasureDialog open={true} onClose={undefined} />
    );

    const nameNode = (await getByTestId(
      "measure-name-input"
    )) as HTMLInputElement;
    userEvent.type(nameNode, "QiCoreMeasure");
    expect(nameNode.value).toBe("QiCoreMeasure");

    const libraryNode = (await getByTestId(
      "cql-library-name-input"
    )) as HTMLInputElement;
    userEvent.type(libraryNode, "QiCore_MeasureLib");
    expect(libraryNode.value).toBe("QiCore_MeasureLib");

    const ecqmNode = (await getByTestId("ecqm-input")) as HTMLInputElement;
    userEvent.type(ecqmNode, "ecqmTitleQdm");
    expect(ecqmNode.value).toBe("ecqmTitleQdm");

    const modelSelect = await getByTestId("measure-model-select");
    const modelSelectBtn = await within(modelSelect).getByRole("button");
    userEvent.click(modelSelectBtn);
    const options = await screen.findAllByRole("option");
    expect(options.length).toEqual(2);
    userEvent.click(options[0]);

    const measurementPeriodStartNode = getByTestId("measurement-period-start");
    const measurementPeriodStartInput = within(
      measurementPeriodStartNode
    ).getByRole("textbox") as HTMLInputElement;
    userEvent.type(
      measurementPeriodStartInput,
      formikInfo.measurementPeriodStart
    );
    expect(measurementPeriodStartInput.value).toBe(
      formikInfo.measurementPeriodStart
    );

    const measurementPeriodEndNode = getByTestId("measurement-period-end");
    const measurementPeriodEndInput = within(
      measurementPeriodEndNode
    ).getByRole("textbox") as HTMLInputElement;
    userEvent.type(measurementPeriodEndInput, formikInfo.measurementPeriodEnd);
    expect(measurementPeriodEndInput.value).toBe(
      formikInfo.measurementPeriodEnd
    );

    const submitButton = await getByTestId("continue-button");
    await waitFor(() => expect(submitButton).toBeDisabled());
  }, 10000);
});
