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
import { axios, useFeatureFlags, checkUserCanEdit } from "@madie/madie-util";
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
  model: Model.QICORE.valueOf(),
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
  checkUserCanDelete: jest.fn().mockImplementation(() => true),
  useUserRoles: () => ({
    isAdmin: false,
    roles: ["MADiE-user"],
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

      const deleteButton = await findByTestId("DeleteOutlinedIcon");
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

  test("Composite bubble is displayed when composite is true", async () => {
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
      expect(queryByTestId("info-QI-Core v4.1.1-0")).toBeInTheDocument()
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
