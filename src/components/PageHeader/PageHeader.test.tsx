import "@testing-library/jest-dom/extend-expect";
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
import { axios, checkUserCanEdit } from "@madie/madie-util";
import PageHeader from "../PageHeader/PageHeader";
import { Model } from "@madie/madie-models/dist/Model";

// First, define all mock data
const mockLib = mockLibraryName();
const mockName = mockMeasureName();
const mockUser = "test user";

const mockLibraryInfo = {
  id: "randomstring",
  cqlLibraryName: "H1Z1",
  model: Model.QICORE.valueOf(),
  version: "0.0.000",
  draft: true,
  cqlErrors: true,
  cql: 'library H1Z1 version \'15.0.100\'\nusing QICore version \'4.1.0\'\nparameter "Measurement Period" Interval<DateTime>\ncontext Patient\ndefine "Definition 1":\n  true\ndefine "Definition 2":\n  true\ndefine "Definition 3":\n  false asdfasdfa sdfasd f',
  elmJson: null,
  elmXml: null,
  createdAt: "2022-08-30T00:38:53.304Z",
  createdBy: "test",
  lastModifiedAt: "2022-08-30T00:40:51.496Z",
  lastModifiedBy: "test",
  publisher: null,
  description: null,
  experimental: false,
};

const mockFormikInfo = {
  measureName: mockName,
  createdBy: "test",
  model: Model.QICORE_6_0_0.valueOf(),
  cqlLibraryName: mockLib,
  ecqmTitle: "ecqmTitle",
  measurementPeriodStart: "01/05/2022",
  measurementPeriodEnd: "03/07/2022",
  active: true,
  measureMetaData: {
    draft: true,
    composite: true,
  },
};

// Then, define all mocks
jest.mock("@madie/madie-util", () => ({
  axios: {
    get: jest.fn(),
    post: jest.fn(),
  },
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
  useCqlLibraryServiceApi: () => ({
    fetchAllLibraries: jest.fn().mockResolvedValue(["library1"]),
    fetchAllOwners: jest.fn().mockResolvedValue(["owner1"]),
  }),
  routeHandlerStore: {
    updateRouteHandlerState: jest.fn(),
    subscribe: (set) => {
      set({ canTravel: true, pendingRoute: "" });
      return { unsubscribe: () => null };
    },
  },
  measureStore: {
    state: {
      createdBy: "test",
      measureName: "test",
    },
    initialState: {
      createdBy: "test",
      measureName: "test",
    },
    subscribe: (set) => {
      set(mockFormikInfo);
      return { unsubscribe: () => null };
    },
    unsubscribe: () => null,
  },
  cqlLibraryStore: {
    // state: mockLibraryInfo,
    // initialState: mockLibraryInfo,
    subscribe: (set) => {
      set(mockLibraryInfo);
      return { unsubscribe: () => null };
    },
    unsubscribe: () => null,
  },
  adminUserStore: {
    state: null,
    initialState: null,
    subscribe: (set) => {
      set(null);
      return { unsubscribe: () => null };
    },
    updateUser: jest.fn(),
  },
  featureFlagsStore: {
    updateFeatureFlags: jest.fn((featureFlags) => featureFlags),
    state: jest.fn().mockImplementation(() => null),
    initialState: jest.fn().mockImplementation(() => null),
    subscribe: (set) => {
      return { unsubscribe: () => null };
    },
  },
  useOktaTokens: () => ({
    getAccessToken: () => "test.jwt",
    getUserName: () => mockUser,
  }),
  checkUserCanEdit: jest.fn().mockImplementation(() => true),
  useFeatureFlags: jest.fn().mockReturnValue({ qdm: false }),
  useUserRoles: jest.fn().mockReturnValue({ roles: [], isAdmin: false }),
  checkUserCanDelete: jest.fn().mockImplementation(() => true),
  useIsRoleOrFeatureEnabled: jest.fn(),
  useUserServiceApi: () => ({
    getOwnerDetails: jest.fn().mockRejectedValue(new Error("not found")),
  }),
  useMeasureReviewServiceApi: () => ({
    getMeasureReview: jest.fn().mockResolvedValue(null),
  }),
  useCqlLibraryReviewServiceApi: () => ({
    getCqlLibraryReview: jest.fn().mockResolvedValue(null),
  }),
}));

let postData: object = { status: 201 };
let getData: object = { status: 200 };
axios.post.mockResolvedValueOnce(postData);
const { findByTestId, queryByText, queryByTestId, getByTestId } = screen;

describe("Page Header and Dialogs", () => {
  jest.mock("@madie/madie-util", () => ({
    useCqlLibraryServiceApi: () => ({
      fetchAllLibraries: jest.fn().mockResolvedValue(["library1"]),
      fetchAllOwners: jest.fn().mockResolvedValue(["owner1"]),
    }),
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
      getUserName: () => mockUser,
    }),
    useUserServiceApi: () => ({
      getOwnerDetails: jest.fn().mockRejectedValue(new Error("not found")),
    }),
    useMeasureReviewServiceApi: () => ({
      getMeasureReview: jest.fn().mockResolvedValue(null),
    }),
    useCqlLibraryReviewServiceApi: () => ({
      getCqlLibraryReview: jest.fn().mockResolvedValue(null),
    }),
  }));
  beforeEach(() => {
    axios.get.mockResolvedValueOnce(getData);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  function renderPageHeader(initialEntries: any) {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <PageHeader />
      </MemoryRouter>
    );
  }

  test("Navigating to the cql-libraries page presents us with a library specific header", async () => {
    renderPageHeader([
      {
        pathname: "/cql-libraries",
        search: "",
        hash: "",
        state: undefined,
        key: "1fewtg",
      },
    ]);
    const dialogButton = await findByTestId("create-new-cql-library-button");
    expect(dialogButton).toBeTruthy();
  });

  test("Navigating to the cql-libraries/edit page presents us with a library specific header", async () => {
    renderPageHeader([
      {
        pathname: "/cql-libraries/randomstring/edit/details",
        search: "",
        hash: "",
        state: undefined,
        key: "1fewtg",
      },
    ]);
    await waitFor(() => {
      expect(queryByText("QI-Core v4.1.1")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(queryByText("Draft")).toBeInTheDocument();
    });
  });

  test("Clicking on new library button retains the same library page", () => {
    let testHistory, testLocation;

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/cql-libraries",
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
    act(async () => {
      const libraryButton = await findByTestId("create-new-cql-library-button");
      expect(libraryButton).toBeTruthy();
      fireEvent.click(libraryButton);
      const dispatchEventSpy = jest.spyOn(window, "dispatchEvent");

      const button = screen.getByTestId("create-new-cql-library-button");
      fireEvent.click(button);
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        new Event("openCreateLibraryDialog")
      );
    });
  });

  test("Clicking on create opens up the create dialog", async () => {
    renderPageHeader([
      {
        pathname: "/measures",
        search: "",
        hash: "",
        state: undefined,
        key: "1fewtg",
      },
    ]);
    const dialogButton = await findByTestId("create-new-measure-button");
    expect(dialogButton).toBeTruthy();
    fireEvent.click(dialogButton);
    const dialog = await findByTestId("dialog-form");
    expect(dialog).toBeTruthy();
  });

  test("Clicking on delete broadcasts an event", async () => {
    await act(async () => {
      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: "/measures/randomstroning/edit/details",
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

      const dispatchEventSpy = jest.spyOn(window, "dispatchEvent");

      const deleteButton = await findByTestId("DeleteMeasure");
      expect(deleteButton).toBeTruthy();
      expect(deleteButton).toBeEnabled();
      await waitFor(() => {
        expect(queryByText("Draft")).toBeInTheDocument();
      });
      act(() => {
        fireEvent.click(deleteButton);
      });
      expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));
      expect(dispatchEventSpy.mock.calls[0][0].type).toBe("delete-measure");
    });
  });

  test("Composite chip is displayed when composite is true", async () => {
    await act(async () => {
      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: "/measures/randomstroning/edit/details",
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

      await waitFor(() => {
        expect(queryByText("Composite")).toBeInTheDocument();
      });
    });
  });

  test("In Composite chip is displayed when measure has compositeMeasureIds", async () => {
    const inCompositeMeasure = {
      ...mockFormikInfo,
      id: "test-measure-id",
      measureSet: { owner: "test", acls: [] },
      compositeMeasureIds: ["composite-measure-id-1"],
    };
    require("@madie/madie-util").measureStore.state = inCompositeMeasure;
    require("@madie/madie-util").measureStore.subscribe = (set) => {
      set(inCompositeMeasure);
      return { unsubscribe: () => null };
    };

    await act(async () => {
      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: "/measures/test-measure-id/edit/details",
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

      await waitFor(() => {
        expect(screen.getByTestId("component-chip")).toBeInTheDocument();
      });
      expect(queryByText("In Composite")).toBeInTheDocument();
    });
  });

  test("In Composite chip is not displayed when measure has no compositeMeasureIds", async () => {
    const notInCompositeMeasure = {
      ...mockFormikInfo,
      id: "test-measure-id",
      measureSet: { owner: "test", acls: [] },
      compositeMeasureIds: [],
    };
    require("@madie/madie-util").measureStore.state = notInCompositeMeasure;
    require("@madie/madie-util").measureStore.subscribe = (set) => {
      set(notInCompositeMeasure);
      return { unsubscribe: () => null };
    };

    await act(async () => {
      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: "/measures/test-measure-id/edit/details",
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

      await waitFor(() => {
        expect(screen.queryByTestId("component-chip")).not.toBeInTheDocument();
      });
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
      expect(await findByTestId("cql-library-name")).toBeInTheDocument();
      expect(await findByTestId("ecqm-text-field")).toBeInTheDocument();
      expect(await findByTestId("continue-button")).toBeInTheDocument();
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
        >
          <PageHeader />
        </MemoryRouter>
      );
      const dialogButton = await findByTestId("create-new-measure-button");
      expect(dialogButton).toBeTruthy();
      fireEvent.click(dialogButton);
      const manualCheck = await findByTestId("manual-generate-checkbox");
      expect(manualCheck).toBeInTheDocument();
      fireEvent.click(manualCheck);
      const autoCheck = await findByTestId("auto-generate-checkbox");
      expect(autoCheck).toBeInTheDocument();
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

      const ecqmNode = await getByTestId("ecqm-input");
      userEvent.type(ecqmNode, mockFormikInfo.ecqmTitle);
      expect(ecqmNode.value).toBe(mockFormikInfo.ecqmTitle);
      Simulate.change(ecqmNode);

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

      const submitButton = await findByTestId("continue-button");
      await waitFor(() => expect(submitButton).not.toBeDisabled(), {
        timeout: 5000,
      });
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalled(),
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
    axios.post.mockRejectedValueOnce({
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
            key: "thisisareallyfakekey",
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

    const ecqmNode = await getByTestId("ecqm-input");
    userEvent.type(ecqmNode, mockFormikInfo.ecqmTitle);
    expect(ecqmNode.value).toBe(mockFormikInfo.ecqmTitle);
    Simulate.change(ecqmNode);

    const modelSelect = await getByTestId("measure-model-select");
    fireEvent.click(modelSelect);
    const modelNode = await getByTestId("measure-model-input");
    fireEvent.select(modelNode, { target: { value: mockFormikInfo.model } });
    expect(modelNode.value).toBe(mockFormikInfo.model);
    Simulate.change(modelNode);

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

    const submitButton = await findByTestId("continue-button");
    await waitFor(() => expect(submitButton).not.toBeDisabled(), {
      timeout: 5000,
    });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled(),
        {
          timeout: 5000,
        };
    });
    await waitFor(() => {
      expect(queryByTestId("server-error-alerts")).toBeInTheDocument();
    });
    expect(getByTestId("close-error-button")).toBeInTheDocument();
    fireEvent.click(getByTestId("close-error-button"));
    await waitFor(() => {
      expect(queryByTestId("server-error-alerts")).not.toBeInTheDocument();
    });
  }, 20000);

  // same values as above aside from error.
  test("our submission fails with an error class error message", async () => {
    axios.post.mockRejectedValueOnce({
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
      expect(queryByTestId("dialog-form")).not.toBeInTheDocument();
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

      const ecqmNode = await getByTestId("ecqm-input");
      userEvent.type(ecqmNode, mockFormikInfo.ecqmTitle);
      expect(ecqmNode.value).toBe(mockFormikInfo.ecqmTitle);
      Simulate.change(ecqmNode);

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
      const submitButton = await findByTestId("continue-button");
      await waitFor(() => expect(submitButton).not.toBeDisabled(), {
        timeout: 5000,
      });
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalled(),
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
    const dialog = await findByTestId("dialog-form");
    expect(dialog).toBeTruthy();
    const closeButton = await findByTestId("close-button");
    expect(closeButton).toBeTruthy();
    fireEvent.click(closeButton);
    await waitFor(() => {
      expect(queryByTestId("close-button")).not.toBeInTheDocument();
    });
  });

  test("On measure edit page measureState is updated and links are rendered, ", async () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/measures/62a7ab0e4fb904343c4f1f79/edit/details",
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
    expect(queryByTestId("info-Active-0")).not.toBeInTheDocument();
    await waitFor(() =>
      expect(queryByTestId("info-QI-Core v6.0.0-0")).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(queryByTestId("info-1/5/2022 - 3/7/2022-1")).toBeInTheDocument()
    );
  });

  test("shows In Use chip when library is locked", async () => {
    (checkUserCanEdit as jest.Mock).mockReturnValue(true);
    const lockedLibrary = {
      ...mockLibraryInfo,
      cqlLibraryLock: {
        lockedBy: "test user",
      },
      librarySet: { owner: "test user", acls: [] },
    };
    require("@madie/madie-util").cqlLibraryStore.state = lockedLibrary;
    require("@madie/madie-util").cqlLibraryStore.subscribe = (set) => {
      set(lockedLibrary);
      return { unsubscribe: () => null };
    };

    render(
      <MemoryRouter
        initialEntries={["/cql-libraries/randomstring/edit/details"]}
      >
        <PageHeader />
      </MemoryRouter>
    );

    expect(
      await screen.findByTestId(
        `library-${lockedLibrary.cqlLibraryName}-inuse-chip`
      )
    ).toBeInTheDocument();

    const tooltipIcon = screen.getByTestId("locked-icon");
    expect(tooltipIcon).toBeInTheDocument();
    userEvent.hover(tooltipIcon);
    await waitFor(() => {
      expect(
        screen.getByText("Locked while being edited by test user")
      ).toBeInTheDocument();
    });
  });

  test("shows locking user's name and harp id in the library In Use chip tooltip", async () => {
    (checkUserCanEdit as jest.Mock).mockReturnValue(true);
    require("@madie/madie-util").useUserServiceApi = () => ({
      getOwnerDetails: jest.fn().mockResolvedValue({
        firstName: "John",
        lastName: "Smith",
        harpId: "test user",
      }),
    });
    const lockedLibrary = {
      ...mockLibraryInfo,
      cqlLibraryLock: {
        lockedBy: "test user",
      },
      librarySet: { owner: "test user", acls: [] },
    };
    require("@madie/madie-util").cqlLibraryStore.state = lockedLibrary;
    require("@madie/madie-util").cqlLibraryStore.subscribe = (set) => {
      set(lockedLibrary);
      return { unsubscribe: () => null };
    };

    render(
      <MemoryRouter
        initialEntries={["/cql-libraries/randomstring/edit/details"]}
      >
        <PageHeader />
      </MemoryRouter>
    );

    const tooltipIcon = await screen.findByTestId("locked-icon");
    userEvent.hover(tooltipIcon);
    await waitFor(() => {
      expect(
        screen.getByText("Locked while being edited by John Smith (test user)")
      ).toBeInTheDocument();
    });
    require("@madie/madie-util").useUserServiceApi = () => ({
      getOwnerDetails: jest.fn().mockRejectedValue(new Error("not found")),
    });
  });

  test("Should not show In Use chip when user cannot edit", async () => {
    (checkUserCanEdit as jest.Mock).mockReturnValue(false);
    const lockedLibrary = {
      ...mockLibraryInfo,
      cqlLibraryLock: {
        lockedBy: "test user",
      },
      librarySet: { owner: "test user", acls: [] },
    };
    require("@madie/madie-util").cqlLibraryStore.state = lockedLibrary;
    require("@madie/madie-util").cqlLibraryStore.subscribe = (set) => {
      set(lockedLibrary);
      return { unsubscribe: () => null };
    };

    render(
      <MemoryRouter
        initialEntries={["/cql-libraries/randomstring/edit/details"]}
      >
        <PageHeader />
      </MemoryRouter>
    );

    expect(
      await screen.queryByTestId(
        `library-${lockedLibrary.cqlLibraryName}-inuse-chip`
      )
    ).not.toBeInTheDocument();
  });

  test("Should not show In Use chip when library is not locked by other user", async () => {
    (checkUserCanEdit as jest.Mock).mockReturnValue(true);
    require("@madie/madie-util").cqlLibraryStore.state = mockLibraryInfo;
    require("@madie/madie-util").cqlLibraryStore.subscribe = (set) => {
      set(mockLibraryInfo);
      return { unsubscribe: () => null };
    };

    render(
      <MemoryRouter
        initialEntries={["/cql-libraries/randomstring/edit/details"]}
      >
        <PageHeader />
      </MemoryRouter>
    );

    expect(
      await screen.queryByTestId(
        `library-${mockLibraryInfo.cqlLibraryName}-inuse-chip`
      )
    ).not.toBeInTheDocument();
  });

  test("handles wafReject event and opens WafDialog", async () => {
    render(
      <MemoryRouter initialEntries={["/measures"]}>
        <PageHeader />
      </MemoryRouter>
    );
    act(() => {
      const event = new CustomEvent("wafReject", {
        detail: { supportId: "12345" },
      });
      document.dispatchEvent(event);
    });
    expect(
      await screen.findByText("WAF Issue Encountered")
    ).toBeInTheDocument();
  });

  test("shows In Use chip when measure is locked", async () => {
    (checkUserCanEdit as jest.Mock).mockReturnValue(true);
    const lockedMeasure = {
      ...mockFormikInfo,
      id: "test-measure-id",
      measureLock: {
        id: "lock-id",
        measureId: "test-measure-id",
        lockedBy: "another user",
        lockedAt: "2025-11-07T10:00:00Z",
      },
      measureSet: { owner: "test user", acls: [] },
    };
    require("@madie/madie-util").measureStore.state = lockedMeasure;
    require("@madie/madie-util").measureStore.subscribe = (set) => {
      set(lockedMeasure);
      return { unsubscribe: () => null };
    };

    render(
      <MemoryRouter initialEntries={["/measures/test-measure-id/edit/details"]}>
        <PageHeader />
      </MemoryRouter>
    );

    expect(
      await screen.findByTestId(
        `measure-${lockedMeasure.measureName}-inuse-chip`
      )
    ).toBeInTheDocument();

    const chip = screen.getByTestId(
      `measure-${lockedMeasure.measureName}-inuse-chip`
    );
    userEvent.hover(chip);
    await waitFor(() => {
      expect(
        screen.getByText("Locked while being edited by another user")
      ).toBeInTheDocument();
    });
  });

  test("shows locking user's name and harp id in the measure In Use chip tooltip", async () => {
    (checkUserCanEdit as jest.Mock).mockReturnValue(true);
    require("@madie/madie-util").useUserServiceApi = () => ({
      getOwnerDetails: jest.fn().mockResolvedValue({
        firstName: "Jane",
        lastName: "Doe",
        harpId: "another user",
      }),
    });
    const lockedMeasure = {
      ...mockFormikInfo,
      id: "test-measure-id",
      measureLock: {
        id: "lock-id",
        measureId: "test-measure-id",
        lockedBy: "another user",
        lockedAt: "2025-11-07T10:00:00Z",
      },
      measureSet: { owner: "test user", acls: [] },
    };
    require("@madie/madie-util").measureStore.state = lockedMeasure;
    require("@madie/madie-util").measureStore.subscribe = (set) => {
      set(lockedMeasure);
      return { unsubscribe: () => null };
    };

    render(
      <MemoryRouter initialEntries={["/measures/test-measure-id/edit/details"]}>
        <PageHeader />
      </MemoryRouter>
    );

    const chip = await screen.findByTestId(
      `measure-${lockedMeasure.measureName}-inuse-chip`
    );
    userEvent.hover(chip);
    await waitFor(() => {
      expect(
        screen.getByText("Locked while being edited by Jane Doe (another user)")
      ).toBeInTheDocument();
    });
    require("@madie/madie-util").useUserServiceApi = () => ({
      getOwnerDetails: jest.fn().mockRejectedValue(new Error("not found")),
    });
  });

  test("Should not show In Use chip when measure user cannot edit", async () => {
    (checkUserCanEdit as jest.Mock).mockReturnValue(false);
    const lockedMeasure = {
      ...mockFormikInfo,
      id: "test-measure-id",
      measureLock: {
        id: "lock-id",
        measureId: "test-measure-id",
        lockedBy: "another user",
        lockedAt: "2025-11-07T10:00:00Z",
      },
      measureSet: { owner: "test user", acls: [] },
    };
    require("@madie/madie-util").measureStore.state = lockedMeasure;
    require("@madie/madie-util").measureStore.subscribe = (set) => {
      set(lockedMeasure);
      return { unsubscribe: () => null };
    };

    render(
      <MemoryRouter initialEntries={["/measures/test-measure-id/edit/details"]}>
        <PageHeader />
      </MemoryRouter>
    );

    expect(
      await screen.queryByTestId(
        `measure-${lockedMeasure.measureName}-inuse-chip`
      )
    ).not.toBeInTheDocument();
  });

  test("Should not show In Use chip when measure is not locked", async () => {
    (checkUserCanEdit as jest.Mock).mockReturnValue(true);
    const unlockedMeasure = {
      ...mockFormikInfo,
      id: "test-measure-id",
      measureSet: { owner: "test user", acls: [] },
    };
    require("@madie/madie-util").measureStore.state = unlockedMeasure;
    require("@madie/madie-util").measureStore.subscribe = (set) => {
      set(unlockedMeasure);
      return { unsubscribe: () => null };
    };

    render(
      <MemoryRouter initialEntries={["/measures/test-measure-id/edit/details"]}>
        <PageHeader />
      </MemoryRouter>
    );

    expect(
      await screen.queryByTestId(
        `measure-${unlockedMeasure.measureName}-inuse-chip`
      )
    ).not.toBeInTheDocument();
  });
});

describe("Admin Page Header", () => {
  const setAdminUser = (user: unknown) => {
    require("@madie/madie-util").adminUserStore.state = user;
    require("@madie/madie-util").adminUserStore.subscribe = (
      set: (u: unknown) => void
    ) => {
      set(user);
      return { unsubscribe: () => null };
    };
  };

  beforeEach(() => {
    axios.get.mockResolvedValueOnce(getData);
    setAdminUser(null);
  });

  test("renders Administration heading when on /admin route", async () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <PageHeader />
      </MemoryRouter>
    );

    expect(screen.getByText("Administration")).toBeInTheDocument();
  });

  test("renders the user profile header when on /admin/userProfile with a user", () => {
    setAdminUser({
      harpId: "jane_doe",
      firstName: "jane",
      lastName: "doe",
      email: "jane.doe@exmaple.com",
      status: "ACTIVE",
      lastLoginAt: null,
    });

    render(
      <MemoryRouter initialEntries={["/admin/userProfile?harpId=jane_doe"]}>
        <PageHeader />
      </MemoryRouter>
    );

    expect(screen.getByTestId("admin-user-profile-name")).toHaveTextContent(
      "jane doe"
    );
    expect(screen.getByTestId("admin-user-profile-harpId")).toHaveTextContent(
      "jane_doe"
    );
    expect(screen.getByTestId("admin-user-profile-email")).toHaveTextContent(
      "jane.doe@exmaple.com"
    );
    expect(screen.getByTestId("back-to-all-users")).toBeInTheDocument();
    expect(screen.queryByText("Administration")).not.toBeInTheDocument();
  });

  test("falls back to Administration heading when on /admin/userProfile but no user is loaded", () => {
    setAdminUser(null);

    render(
      <MemoryRouter initialEntries={["/admin/userProfile?harpId=missing_user"]}>
        <PageHeader />
      </MemoryRouter>
    );

    expect(screen.getByText("Administration")).toBeInTheDocument();
    expect(
      screen.queryByTestId("admin-user-profile-name")
    ).not.toBeInTheDocument();
  });

  test("maps each known status to its display label and renders the chip", () => {
    const cases: Array<[string, string]> = [
      ["ACTIVE", "Active"],
      ["DEACTIVATED", "Deactivated"],
      ["ERROR_SUSPENDED", "Suspended"],
    ];

    for (const [status, label] of cases) {
      setAdminUser({
        harpId: "h",
        firstName: "F",
        lastName: "L",
        email: "e",
        status,
      });
      axios.get.mockResolvedValueOnce(getData);

      const { unmount } = render(
        <MemoryRouter initialEntries={["/admin/userProfile?harpId=h"]}>
          <PageHeader />
        </MemoryRouter>
      );

      const chip = screen.getByTestId(`admin-status-chip-${status}`);
      expect(chip).toBeInTheDocument();
      expect(chip).toHaveTextContent(label);
      expect(chip.className).toContain(
        `admin-status-chip--${status.toLowerCase()}`
      );

      unmount();
    }
  });

  test("displays the raw status string when not in the known mapping", () => {
    setAdminUser({
      harpId: "h",
      firstName: "F",
      lastName: "L",
      email: "e",
      status: "UNKNOWN_STATUS",
    });

    render(
      <MemoryRouter initialEntries={["/admin/userProfile?harpId=h"]}>
        <PageHeader />
      </MemoryRouter>
    );

    expect(
      screen.getByTestId("admin-status-chip-UNKNOWN_STATUS")
    ).toHaveTextContent("UNKNOWN_STATUS");
  });

  test("shows '-' for last login when lastLoginAt is null", () => {
    setAdminUser({
      harpId: "h",
      firstName: "F",
      lastName: "L",
      email: "e",
      status: "ACTIVE",
      lastLoginAt: null,
    });

    render(
      <MemoryRouter initialEntries={["/admin/userProfile?harpId=h"]}>
        <PageHeader />
      </MemoryRouter>
    );

    expect(
      screen.getByTestId("admin-user-profile-last-login")
    ).toHaveTextContent("-");
  });

  test("formats today's last login as MM/DD/YYYY with no 'days ago' suffix", () => {
    const today = new Date();
    setAdminUser({
      harpId: "h",
      firstName: "F",
      lastName: "L",
      email: "e",
      status: "ACTIVE",
      lastLoginAt: today.toISOString(),
    });

    render(
      <MemoryRouter initialEntries={["/admin/userProfile?harpId=h"]}>
        <PageHeader />
      </MemoryRouter>
    );

    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const yyyy = today.getFullYear();
    const expected = `${mm}/${dd}/${yyyy}`;

    const lastLogin = screen.getByTestId("admin-user-profile-last-login");
    expect(lastLogin).toHaveTextContent(expected);
    expect(lastLogin.textContent).not.toMatch(/days ago/);
  });

  test("formats a past last login as MM/DD/YYYY with '(N days ago)' suffix", () => {
    const past = new Date();
    past.setDate(past.getDate() - 10);
    setAdminUser({
      harpId: "h",
      firstName: "F",
      lastName: "L",
      email: "e",
      status: "ACTIVE",
      lastLoginAt: past.toISOString(),
    });

    render(
      <MemoryRouter initialEntries={["/admin/userProfile?harpId=h"]}>
        <PageHeader />
      </MemoryRouter>
    );

    const mm = String(past.getMonth() + 1).padStart(2, "0");
    const dd = String(past.getDate()).padStart(2, "0");
    const yyyy = past.getFullYear();
    expect(
      screen.getByTestId("admin-user-profile-last-login")
    ).toHaveTextContent(`${mm}/${dd}/${yyyy} (10 days ago)`);
  });

  test("Back to All Users button clears the store and navigates to /admin", () => {
    setAdminUser({
      harpId: "h",
      firstName: "F",
      lastName: "L",
      email: "e",
      status: "ACTIVE",
    });
    const updateUserMock = jest.fn();
    require("@madie/madie-util").adminUserStore.updateUser = updateUserMock;

    render(
      <MemoryRouter initialEntries={["/admin/userProfile?harpId=h"]}>
        <PageHeader />
      </MemoryRouter>
    );

    userEvent.click(screen.getByTestId("back-to-all-users"));

    expect(updateUserMock).toHaveBeenCalledWith(null);
    expect(screen.getByText("Administration")).toBeInTheDocument();
    expect(
      screen.queryByTestId("admin-user-profile-name")
    ).not.toBeInTheDocument();
  });
});

describe("Review status in the header", () => {
  const util = () => require("@madie/madie-util");

  const measureWithId = {
    ...mockFormikInfo,
    id: "test-measure-id",
    measureSet: { owner: "test user", acls: [] },
  };

  const libraryWithId = {
    ...mockLibraryInfo,
    id: "test-library-id",
    librarySet: { owner: "test user", acls: [] },
  };

  const setMeasureReview = (review: unknown) => {
    const api = { getMeasureReview: () => Promise.resolve(review) };
    util().useMeasureReviewServiceApi = () => api;
  };

  const setLibraryReview = (review: unknown) => {
    const api = { getCqlLibraryReview: () => Promise.resolve(review) };
    util().useCqlLibraryReviewServiceApi = () => api;
  };

  const setIsReviewer = (isReviewer: boolean) => {
    const roles = { roles: [], isAdmin: false, isReviewer };
    util().useUserRoles = () => roles;
  };

  beforeEach(() => {
    axios.get.mockResolvedValue(getData);
    (checkUserCanEdit as jest.Mock).mockReturnValue(true);
    setIsReviewer(false);
    setMeasureReview(null);
    setLibraryReview(null);
    util().measureStore.state = measureWithId;
    util().measureStore.subscribe = (set) => {
      set(measureWithId);
      return { unsubscribe: () => null };
    };
    util().cqlLibraryStore.subscribe = (set) => {
      set(libraryWithId);
      return { unsubscribe: () => null };
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    setIsReviewer(false);
    setMeasureReview(null);
    setLibraryReview(null);
  });

  const renderMeasureHeader = () =>
    render(
      <MemoryRouter initialEntries={["/measures/test-measure-id/edit/details"]}>
        <PageHeader />
      </MemoryRouter>
    );

  const renderLibraryHeader = () =>
    render(
      <MemoryRouter
        initialEntries={["/cql-libraries/test-library-id/edit/details"]}
      >
        <PageHeader />
      </MemoryRouter>
    );

  describe("measure header", () => {
    test.each([
      ["READY_FOR_REVIEW", "Review Status: Ready"],
      ["IN_PROGRESS", "Review Status: In Progress"],
      ["COMPLETE", "Review Status: Complete"],
    ])("displays %s as '%s'", async (status, expected) => {
      setMeasureReview({ id: "review-1", status });

      renderMeasureHeader();

      expect(
        await screen.findByTestId("measure-review-status")
      ).toHaveTextContent(expected);
    });

    test("displays nothing when the measure has no review", async () => {
      setMeasureReview(null);

      renderMeasureHeader();

      await screen.findByText(`Version ${measureWithId.version}`);
      expect(
        screen.queryByTestId("measure-review-status")
      ).not.toBeInTheDocument();
    });

    test("displays nothing when the status is NOT_READY_FOR_REVIEW", async () => {
      setMeasureReview({ id: "review-1", status: "NOT_READY_FOR_REVIEW" });

      renderMeasureHeader();

      await screen.findByText(`Version ${measureWithId.version}`);
      expect(
        screen.queryByTestId("measure-review-status")
      ).not.toBeInTheDocument();
    });

    test("displays the status to a user with edit access who is not a reviewer", async () => {
      (checkUserCanEdit as jest.Mock).mockReturnValue(true);
      setIsReviewer(false);
      setMeasureReview({ id: "review-1", status: "IN_PROGRESS" });

      renderMeasureHeader();

      expect(
        await screen.findByTestId("measure-review-status")
      ).toHaveTextContent("Review Status: In Progress");
    });

    test("displays the status to a reviewer without edit access", async () => {
      (checkUserCanEdit as jest.Mock).mockReturnValue(false);
      setIsReviewer(true);
      setMeasureReview({ id: "review-1", status: "COMPLETE" });

      renderMeasureHeader();

      expect(
        await screen.findByTestId("measure-review-status")
      ).toHaveTextContent("Review Status: Complete");
    });

    test("hides the status from a user with neither edit access nor the reviewer role", async () => {
      (checkUserCanEdit as jest.Mock).mockReturnValue(false);
      setIsReviewer(false);
      setMeasureReview({ id: "review-1", status: "READY_FOR_REVIEW" });

      renderMeasureHeader();

      await screen.findByText(`Version ${measureWithId.version}`);
      expect(
        screen.queryByTestId("measure-review-status")
      ).not.toBeInTheDocument();
    });

    test("updates the status when a review is saved elsewhere", async () => {
      setMeasureReview({ id: "review-1", status: "READY_FOR_REVIEW" });

      renderMeasureHeader();

      expect(
        await screen.findByTestId("measure-review-status")
      ).toHaveTextContent("Review Status: Ready");

      act(() => {
        window.dispatchEvent(
          new CustomEvent("review-measure-saved", {
            detail: { id: "review-1", status: "COMPLETE" },
          })
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId("measure-review-status")).toHaveTextContent(
          "Review Status: Complete"
        );
      });
    });
  });

  describe("library header", () => {
    test.each([
      ["READY_FOR_REVIEW", "Review Status: Ready"],
      ["IN_PROGRESS", "Review Status: In Progress"],
      ["COMPLETE", "Review Status: Complete"],
    ])("displays %s as '%s'", async (status, expected) => {
      setLibraryReview({ id: "review-1", status });

      renderLibraryHeader();

      expect(await screen.findByTestId("cql-library-status")).toHaveTextContent(
        expected
      );
    });

    test("displays the status to a reviewer without edit access", async () => {
      (checkUserCanEdit as jest.Mock).mockReturnValue(false);
      setIsReviewer(true);
      setLibraryReview({ id: "review-1", status: "IN_PROGRESS" });

      renderLibraryHeader();

      expect(await screen.findByTestId("cql-library-status")).toHaveTextContent(
        "Review Status: In Progress"
      );
    });

    test("hides the status from a user with neither edit access nor the reviewer role", async () => {
      (checkUserCanEdit as jest.Mock).mockReturnValue(false);
      setIsReviewer(false);
      setLibraryReview({ id: "review-1", status: "READY_FOR_REVIEW" });

      renderLibraryHeader();

      expect(
        await screen.findByText(`Version ${libraryWithId.version}`)
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId("cql-library-status")
      ).not.toBeInTheDocument();
    });

    test("displays nothing when the library has no review", async () => {
      setLibraryReview(null);

      renderLibraryHeader();

      expect(
        await screen.findByText(`Version ${libraryWithId.version}`)
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId("cql-library-status")
      ).not.toBeInTheDocument();
    });
  });
});
