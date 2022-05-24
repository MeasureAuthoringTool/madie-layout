import "@testing-library/jest-dom";
// NOTE: jest-dom adds handy assertions to Jest and is recommended, but not required

import * as React from "react";
import {
  screen,
  render,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { act, Simulate } from "react-dom/test-utils";
import { describe, expect, test } from "@jest/globals";
import userEvent from "@testing-library/user-event";
import { mockLibraryName, mockMeasureName } from "../NewMeasure/bulkCreate";
import axios from "axios";
import PageHeader from "../PageHeader/PageHeader";

const mockLib = mockLibraryName();
const mockName = mockMeasureName();

const mockFormikInfo = {
  measureName: mockName,
  model: "QI-Core",
  cqlLibraryName: mockLib,
  measureScoring: "Cohort",
  measurementPeriodStart: "01/05/2022",
  measurementPeriodEnd: "03/07/2022",
  active: true,
};

jest.mock("@madie/madie-util", () => ({
  getServiceConfig: () => ({
    measureService: {
      baseUrl: "example-service-url",
    },
  }),
  measureStore: {
    state: null,
    initialState: null,
    subscribe: (set) => {
      set(mockFormikInfo);
      return { unsubscribe: () => null };
    },
    unsubscribe: () => null,
  },
  useOktaTokens: () => ({
    getAccessToken: () => "test.jwt",
    getUserName: () => "nosec@example.com", //#nosec
  }),
}));

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;
let postData: object = { status: 201 };
let getData: object = { status: 200 };
mockedAxios.post.mockResolvedValueOnce(postData);
mockedAxios.get.mockResolvedValueOnce(getData);
const { findByTestId, queryByTestId, getByTestId } = screen;

describe("Measures Create Dialog", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Clicking on create opens up the create dialog", async () => {
    await act(async () => {
      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: "/measures",
              search: "",
              hash: "",
              state: undefined,
              key: "1fewtg",
            },
          ]}
        >
          <PageHeader />
        </MemoryRouter>
      );
      const dialogButton = await findByTestId("create-new-measure-button");
      expect(dialogButton).toBeTruthy();
      fireEvent.click(dialogButton);
      const dialog = await findByTestId("create-dialog");
      expect(dialog).toBeTruthy();
    });
  });

  test("Form items are all there except for our hidden item", async () => {
    await act(async () => {
      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: "/measures",
              search: "",
              hash: "",
              state: undefined,
              key: "1fewtg",
            },
          ]}
        >
          <PageHeader />
        </MemoryRouter>
      );
      const dialogButton = await findByTestId("create-new-measure-button");
      expect(dialogButton).toBeTruthy();
      fireEvent.click(dialogButton);
      expect(await findByTestId("measure-name-text-field")).toBeInTheDocument();
      expect(await findByTestId("measure-model-select")).toBeInTheDocument();
      expect(await findByTestId("model-version-select")).toBeInTheDocument();
      expect(await findByTestId("cql-library-name")).toBeInTheDocument();
      expect(await findByTestId("eqcm-text-field")).toBeInTheDocument();
      expect(await findByTestId("auto-generate-checkbox")).toBeInTheDocument();
      expect(
        await findByTestId("manual-generate-checkbox")
      ).toBeInTheDocument();
      expect(
        await findByTestId("measure-scoring-select-field")
      ).toBeInTheDocument();
      expect(await findByTestId("subject-select")).toBeInTheDocument();
      expect(
        await findByTestId("create-new-measure-save-button")
      ).toBeInTheDocument();
      expect(queryByTestId("CMSID-text-field")).not.toBeVisible();
    });
  });

  // temporarily skipping until it's added back in to document
  test.skip("checking the checkbox for manual entry makes cmsid visible", async () => {
    await act(async () => {
      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: "/measures",
              search: "",
              hash: "",
              state: undefined,
              key: "1fewtg",
            },
          ]}
        ></MemoryRouter>
      );
      const dialogButton = await findByTestId("create-new-measure-button");
      expect(dialogButton).toBeTruthy();
      fireEvent.click(dialogButton);
      const manualCheck = await findByTestId("manual-generate-checkbox");
      fireEvent.click(manualCheck);
      expect(queryByTestId("CMSID-text-field")).toBeVisible();
    });
  });

  test("our submission works as intended", async () => {
    await act(async () => {
      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: "/measures",
              search: "",
              hash: "",
              state: undefined,
              key: "1fewtg",
            },
          ]}
        >
          <PageHeader />
        </MemoryRouter>
      );

      const dialogButton = await findByTestId("create-new-measure-button");
      expect(queryByTestId("create-dialog")).not.toBeInTheDocument();
      expect(dialogButton).toBeTruthy();
      fireEvent.click(dialogButton);
      // we gotta hit the input to change the value of material ui components. make sure they have ids
      const nameNode = await getByTestId("measure-name-input");
      userEvent.type(nameNode, mockFormikInfo.measureName);
      expect(nameNode.value).toBe(mockFormikInfo.measureName);
      Simulate.change(nameNode);

      fireEvent.click(getByTestId("measure-name-text-field"));
      fireEvent.blur(getByTestId("measure-name-text-field"));

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

      const scoringSelect = await getByTestId("measure-scoring-select-field");
      fireEvent.click(scoringSelect);
      const scoringNode = await getByTestId("measure-scoring-input");
      fireEvent.select(scoringNode, {
        target: { value: mockFormikInfo.measureScoring },
      });
      expect(scoringNode.value).toBe(mockFormikInfo.measureScoring);
      Simulate.change(scoringNode);

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
      await act(async () => {
        await waitFor(() =>
          expect(measurementPeriodStartInput.value).toBe(
            mockFormikInfo.measurementPeriodStart
          )
        );
      });

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

      const submitButton = await findByTestId("create-new-measure-save-button");
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
        expect(queryByTestId("server-error-alerts")).not.toBeInTheDocument();
      });
    });
  }, 20000);

  // same values aside from mockReject
  test("our submission fails as with generic error message", async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        data: {
          message: "a message",
        },
      },
    });

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/measures",
            search: "",
            hash: "",
            state: undefined,
            key: "asdfasdfasdf",
          },
        ]}
      >
        <PageHeader />
      </MemoryRouter>
    );

    const dialogButton = await findByTestId("create-new-measure-button");
    expect(queryByTestId("create-dialog")).not.toBeInTheDocument();
    expect(dialogButton).toBeTruthy();
    fireEvent.click(dialogButton);
    // we gotta hit the input to change the value of material ui components. make sure they have ids
    const nameNode = await getByTestId("measure-name-input");
    userEvent.type(nameNode, mockFormikInfo.measureName);
    expect(nameNode.value).toBe(mockFormikInfo.measureName);
    Simulate.change(nameNode);

    fireEvent.click(getByTestId("measure-name-text-field"));
    fireEvent.blur(getByTestId("measure-name-text-field"));

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

    const scoringSelect = await getByTestId("measure-scoring-select-field");
    fireEvent.click(scoringSelect);
    const scoringNode = await getByTestId("measure-scoring-input");
    fireEvent.select(scoringNode, {
      target: { value: mockFormikInfo.measureScoring },
    });
    expect(scoringNode.value).toBe(mockFormikInfo.measureScoring);
    Simulate.change(scoringNode);

    const measurementPeriodStartNode = getByTestId("measurement-period-start");
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

    const submitButton = await findByTestId("create-new-measure-save-button");
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
      expect(queryByTestId("server-error-alerts")).toBeInTheDocument();
    });
  }, 20000);

  // same values as above aside from error.
  test("our submission fails with an error class error message", async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        data: {
          message: "server error:",
          validationErrors: ["error 1", "error 2"],
        },
      },
    });
    await act(async () => {
      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: "/measures",
              search: "",
              hash: "",
              state: undefined,
              key: "1fewtg",
            },
          ]}
        >
          <PageHeader />
        </MemoryRouter>
      );
      const dialogButton = await findByTestId("create-new-measure-button");
      expect(queryByTestId("create-dialog")).not.toBeInTheDocument();
      expect(dialogButton).toBeTruthy();
      fireEvent.click(dialogButton);
      // we gotta hit the input to change the value of material ui components. make sure they have ids
      const nameNode = await getByTestId("measure-name-input");
      userEvent.type(nameNode, mockFormikInfo.measureName);
      expect(nameNode.value).toBe(mockFormikInfo.measureName);
      Simulate.change(nameNode);

      fireEvent.click(getByTestId("measure-name-text-field"));
      fireEvent.blur(getByTestId("measure-name-text-field"));

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

      const scoringSelect = await getByTestId("measure-scoring-select-field");
      fireEvent.click(scoringSelect);
      const scoringNode = await getByTestId("measure-scoring-input");
      fireEvent.select(scoringNode, {
        target: { value: mockFormikInfo.measureScoring },
      });
      expect(scoringNode.value).toBe(mockFormikInfo.measureScoring);
      Simulate.change(scoringNode);

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
      const submitButton = await findByTestId("create-new-measure-save-button");
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
        expect(queryByTestId("server-error-alerts")).toBeInTheDocument();
      });
    });
  }, 20000);

  test("We can open and close the form from measures", async () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/measures",
            search: "",
            hash: "",
            state: undefined,
            key: "1fewtg",
          },
        ]}
      >
        <PageHeader />
      </MemoryRouter>
    );
    const dialogButton = await findByTestId("create-new-measure-button");
    expect(dialogButton).toBeTruthy();
    fireEvent.click(dialogButton);
    const dialog = await findByTestId("create-dialog");
    expect(dialog).toBeTruthy();
    const closeButton = await findByTestId("close-button");
    expect(closeButton).toBeTruthy();
    fireEvent.click(closeButton);
    await waitFor(() => {
      expect(queryByTestId("close-button")).not.toBeInTheDocument();
    });
  });

  test("On edit page measureState is updated and links are rendered, ", async () => {
    jest.mock("@madie/madie-util", () => ({
      getServiceConfig: () => ({
        measureService: {
          baseUrl: "example-service-url",
        },
      }),
      measureStore: {
        state: mockFormikInfo,
        initialState: mockFormikInfo,
        subscribe: (set) => {
          set(mockFormikInfo);
          return { unsubscribe: () => null };
        },
        unsubscribe: () => null,
      },
      useOktaTokens: () => ({
        getAccessToken: () => "test.jwt",
        getUserName: () => "nosec@example.com", //#nosec
      }),
    }));

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/edit",
            search: "",
            hash: "",
            state: undefined,
            key: "1fewtg",
          },
        ]}
      >
        <PageHeader />
      </MemoryRouter>
    );
    expect(queryByTestId("info-Active-0")).toBeInTheDocument();
  });
});
