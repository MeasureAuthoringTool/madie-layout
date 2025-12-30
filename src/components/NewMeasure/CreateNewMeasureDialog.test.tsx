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
// @ts-ignore
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
  useMeasureServiceApi: () => ({
    getUserInfo: jest.fn().mockResolvedValue({}),
    unlockMeasures: jest.fn().mockResolvedValue({}),
  }),
  useCqlLibraryServiceApi: () => ({
    getUserInfo: jest.fn().mockResolvedValue({}),
    unlockLibraries: jest.fn().mockResolvedValue({}),
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
      const { findByTestId } = render(
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
      ).getByRole("textbox") as HTMLInputElement;
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
      const { queryByTestId, getByTestId } = render(
        <CreateNewMeasureDialog open={true} onClose={undefined} />
      );

      const nameNode = (await screen.findByTestId(
        "measure-name-input"
      )) as HTMLInputElement;
      userEvent.type(nameNode, formikInfo.measureName);
      expect(nameNode.value).toBe(formikInfo.measureName);
      Simulate.change(nameNode);

      const libraryNode = getByTestId(
        "cql-library-name-input"
      ) as HTMLInputElement;
      userEvent.type(libraryNode, formikInfo.cqlLibraryName);
      expect(libraryNode.value).toBe(formikInfo.cqlLibraryName);
      Simulate.change(libraryNode);

      const ecqmNode = getByTestId("ecqm-input") as HTMLInputElement;
      userEvent.type(ecqmNode, formikInfo.ecqmTitle);
      expect(ecqmNode.value).toBe(formikInfo.ecqmTitle);
      Simulate.change(ecqmNode);

      const modelSelect = getByTestId("measure-model-select");
      fireEvent.click(modelSelect);
      const modelNode = getByTestId("measure-model-input") as HTMLInputElement;
      fireEvent.select(modelNode, { target: { value: formikInfo.model } });
      expect(modelNode.value).toBe(formikInfo.model);
      Simulate.change(modelNode);

      const measurementPeriodStartNode = getByTestId(
        "measurement-period-start"
      );
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
      userEvent.type(
        measurementPeriodEndInput,
        formikInfo.measurementPeriodEnd
      );
      expect(measurementPeriodEndInput.value).toBe(
        formikInfo.measurementPeriodEnd
      );

      const submitButton = getByTestId("continue-button");
      expect(submitButton).not.toBeDisabled();
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(queryByTestId("server-error-alerts")).not.toBeInTheDocument();
      });
    });
  });

  test("the dialog allows create for a QDM measure with underscore in library name", async () => {
    (useFeatureFlags as jest.Mock).mockReturnValue({ qdm: true });
    const { queryByTestId, getByTestId } = render(
      <CreateNewMeasureDialog open={true} onClose={undefined} />
    );

    const nameNode = getByTestId("measure-name-input") as HTMLInputElement;
    userEvent.type(nameNode, "QdmMeasure");
    expect(nameNode.value).toBe("QdmMeasure");

    const libraryNode = getByTestId(
      "cql-library-name-input"
    ) as HTMLInputElement;
    userEvent.type(libraryNode, "Qdm_MeasureLib");
    expect(libraryNode.value).toBe("Qdm_MeasureLib");

    const ecqmNode = getByTestId("ecqm-input") as HTMLInputElement;
    userEvent.type(ecqmNode, "ecqmTitleQdm");
    expect(ecqmNode.value).toBe("ecqmTitleQdm");

    const modelSelect = getByTestId("measure-model-select");
    const modelSelectBtn = within(modelSelect).getByRole("combobox");
    userEvent.click(modelSelectBtn);
    const options = await screen.findAllByRole("option");
    expect(options.length).toEqual(3);
    userEvent.click(options[2]);

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

    const submitButton = getByTestId("continue-button");
    await waitFor(() => expect(submitButton).not.toBeDisabled());
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(queryByTestId("server-error-alerts")).not.toBeInTheDocument();
    });
  }, 10000);

  test("checking if error text is displayed for invalid dates", async () => {
    await act(async () => {
      render(<CreateNewMeasureDialog open={true} onClose={undefined} />);

      const measurementPeriodStartNode = await screen.findByTestId(
        "measurement-period-start"
      );
      const measurementPeriodStartInput = within(
        measurementPeriodStartNode
      ).getByRole("textbox");
      userEvent.type(measurementPeriodStartInput, "12/33");

      const measurementPeriodEndNode = await screen.findByTestId(
        "measurement-period-end"
      );
      const measurementPeriodEndInput = within(
        measurementPeriodEndNode
      ).getByRole("textbox") as HTMLInputElement;
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
          screen.getByTestId("measurement-period-start-helper-text")
        ).not.toBe(null);
        expect(
          screen.getByTestId("measurement-period-start-helper-text")
        ).toHaveTextContent("Invalid date format. (mm/dd/yyyy)");
      });

      expect(screen.getByTestId("continue-button")).toBeDisabled();
    });
  });

  test("checking if error text is displayed when measurement periods are not provided", async () => {
    await act(async () => {
      render(<CreateNewMeasureDialog open={true} onClose={undefined} />);

      const measurementPeriodStartNode = await screen.findByTestId(
        "measurement-period-start"
      );
      const measurementPeriodStartInput = within(
        measurementPeriodStartNode
      ).getByRole("textbox");
      userEvent.type(measurementPeriodStartInput, "");

      const measurementPeriodEndNode = await screen.findByTestId(
        "measurement-period-end"
      );
      const measurementPeriodEndInput = within(
        measurementPeriodEndNode
      ).getByRole("textbox") as HTMLInputElement;
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
          screen.getByTestId("measurement-period-start-helper-text")
        ).not.toBe(null);
        expect(
          screen.getByTestId("measurement-period-start-helper-text")
        ).toHaveTextContent("Measurement period start date is required");
      });

      expect(screen.getByTestId("continue-button")).toBeDisabled();
    });
  });

  test("checking if error text is displayed when measurement periods are not between the years 1900 and 2100", async () => {
    await act(async () => {
      render(<CreateNewMeasureDialog open={true} onClose={undefined} />);

      const measurementPeriodStartNode = await screen.findByTestId(
        "measurement-period-start"
      );
      const measurementPeriodStartInput = within(
        measurementPeriodStartNode
      ).getByRole("textbox");
      userEvent.type(measurementPeriodStartInput, "12/22/2100");

      const measurementPeriodEndNode = await screen.findByTestId(
        "measurement-period-end"
      );
      const measurementPeriodEndInput = within(
        measurementPeriodEndNode
      ).getByRole("textbox") as HTMLInputElement;
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
          screen.getByTestId("measurement-period-start-helper-text")
        ).not.toBe(null);
        expect(
          screen.getByTestId("measurement-period-start-helper-text")
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
        getByTestId("measurement-period-end-helper-text")
      ).toBeInTheDocument();
      expect(
        getByTestId("measurement-period-end-helper-text")
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
        screen.getByTestId("measurement-period-end-helper-text")
      ).toBeInTheDocument();
      expect(
        getByTestId("measurement-period-end-helper-text")
      ).toHaveTextContent(
        "Measurement period end date should be greater than measurement period start date."
      );
      expect(getByTestId("continue-button")).toBeDisabled();
    });
  });

  test("the dialog does not allow create for a QI-Core measure with underscore in library name", async () => {
    (useFeatureFlags as jest.Mock).mockReturnValue({ qdm: true });
    const { getByTestId } = render(
      <CreateNewMeasureDialog open={true} onClose={undefined} />
    );

    const nameNode = getByTestId("measure-name-input") as HTMLInputElement;
    userEvent.type(nameNode, "QiCoreMeasure");
    expect(nameNode.value).toBe("QiCoreMeasure");

    const libraryNode = getByTestId(
      "cql-library-name-input"
    ) as HTMLInputElement;
    userEvent.type(libraryNode, "QiCore_MeasureLib");
    expect(libraryNode.value).toBe("QiCore_MeasureLib");

    const ecqmNode = getByTestId("ecqm-input") as HTMLInputElement;
    userEvent.type(ecqmNode, "ecqmTitleQdm");
    expect(ecqmNode.value).toBe("ecqmTitleQdm");

    const modelSelect = getByTestId("measure-model-select");
    const modelSelectBtn = within(modelSelect).getByRole("combobox");
    userEvent.click(modelSelectBtn);
    const options = await screen.findAllByRole("option");
    expect(options.length).toEqual(3);
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

    const submitButton = getByTestId("continue-button");
    await waitFor(() => expect(submitButton).toBeDisabled());
  }, 10000);

  test("Model dropdown shows QI-Core v6.0.0", async () => {
    const { getByTestId } = render(
      <CreateNewMeasureDialog open={true} onClose={undefined} />
    );
    const modelSelectDropDown = getByTestId("measure-model-select");
    const modelSelectBtn = within(modelSelectDropDown).getByRole("combobox");
    userEvent.click(modelSelectBtn);
    expect(
      getByTestId("measure-model-option-QI-Core v4.1.1")
    ).toBeInTheDocument();
    expect(
      getByTestId("measure-model-option-QI-Core v6.0.0")
    ).toBeInTheDocument();
    expect(getByTestId("measure-model-option-QDM v5.6")).toBeInTheDocument();
  });

  test("Model dropdown does not shows QI-Core v7.0.0", async () => {
    const { getByTestId, queryByTestId } = render(
      <CreateNewMeasureDialog open={true} onClose={undefined} />
    );
    const modelSelectDropDown = getByTestId("measure-model-select");
    const modelSelectBtn = within(modelSelectDropDown).getByRole("combobox");
    userEvent.click(modelSelectBtn);
    expect(
      getByTestId("measure-model-option-QI-Core v4.1.1")
    ).toBeInTheDocument();
    expect(
      getByTestId("measure-model-option-QI-Core v6.0.0")
    ).toBeInTheDocument();
    expect(getByTestId("measure-model-option-QDM v5.6")).toBeInTheDocument();
    expect(
      queryByTestId("measure-model-option-QI-Core v7.0.0")
    ).not.toBeInTheDocument();
  });

  test("Model dropdown shows QI-Core v7.0.0 when feature flag is on", async () => {
    (useFeatureFlags as jest.Mock).mockReturnValue({ qiCore7: true });
    const { getByTestId } = render(
      <CreateNewMeasureDialog open={true} onClose={undefined} />
    );
    const modelSelectDropDown = getByTestId("measure-model-select");
    const modelSelectBtn = within(modelSelectDropDown).getByRole("combobox");
    userEvent.click(modelSelectBtn);
    expect(
      getByTestId("measure-model-option-QI-Core v4.1.1")
    ).toBeInTheDocument();
    expect(
      getByTestId("measure-model-option-QI-Core v6.0.0")
    ).toBeInTheDocument();
    expect(getByTestId("measure-model-option-QDM v5.6")).toBeInTheDocument();
    expect(
      getByTestId("measure-model-option-QI-Core v7.0.0")
    ).toBeInTheDocument();
  });

  test("Composite check box should be visible if feature flag is ON and model is QI-Core", async () => {
    (useFeatureFlags as jest.Mock).mockReturnValue({
      QICoreCompositeMeasure: true,
    });
    const { getByTestId, queryByTestId } = render(
      <CreateNewMeasureDialog open={true} onClose={undefined} />
    );
    const modelSelectDropDown = getByTestId("measure-model-select");
    const modelSelectBtn = within(modelSelectDropDown).getByRole("combobox");
    userEvent.click(modelSelectBtn);

    const option = getByTestId("measure-model-option-QI-Core v4.1.1");
    userEvent.click(option);

    expect(queryByTestId("composite")).toBeInTheDocument();
  });

  test("Composite check box should NOT be visible if feature flag is OFF and model is QI-Core", async () => {
    (useFeatureFlags as jest.Mock).mockReturnValue({
      QICoreCompositeMeasure: false,
    });
    const { getByTestId, queryByTestId } = render(
      <CreateNewMeasureDialog open={true} onClose={undefined} />
    );
    const modelSelectDropDown = getByTestId("measure-model-select");
    const modelSelectBtn = within(modelSelectDropDown).getByRole("combobox");
    userEvent.click(modelSelectBtn);

    const option = getByTestId("measure-model-option-QI-Core v4.1.1");
    userEvent.click(option);

    expect(queryByTestId("composite")).not.toBeInTheDocument();
  });

  test("Composite check box should NOT be visible if feature flag is ON and model is QDM", async () => {
    (useFeatureFlags as jest.Mock).mockReturnValue({
      QICoreCompositeMeasure: true,
    });
    const { getByTestId, queryByTestId } = render(
      <CreateNewMeasureDialog open={true} onClose={undefined} />
    );
    const modelSelectDropDown = getByTestId("measure-model-select");
    const modelSelectBtn = within(modelSelectDropDown).getByRole("combobox");
    userEvent.click(modelSelectBtn);

    const option = getByTestId("measure-model-option-QDM v5.6");
    userEvent.click(option);

    expect(queryByTestId("composite")).not.toBeInTheDocument();
  });
});
