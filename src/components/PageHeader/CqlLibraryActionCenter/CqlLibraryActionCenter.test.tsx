import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import CqlLibraryActionCenter from "./CqlLibraryActionCenter";
import { CqlLibrary, LibrarySet, Model } from "@madie/madie-models";
import userEvent from "@testing-library/user-event";
import {
  routeHandlerStore,
  checkUserCanEdit,
  useUserRoles,
  useFeatureFlags,
} from "@madie/madie-util";
import { act } from "react-dom/test-utils";

const mockUser = "test user";

const mockLibrarySet = {
  librarySetId: "1-2-3-4",
  owner: mockUser,
} as unknown as LibrarySet;

const cqlLibrary = {
  id: "622e1f46d1fd3729d861e6cb",
  cqlLibraryName: "TestCqlLibrary1",
  model: Model.QICORE,
  draft: true,
  createdAt: null,
  createdBy: null,
  lastModifiedAt: null,
  lastModifiedBy: null,
  librarySet: mockLibrarySet,
} as unknown as CqlLibrary;

const versionedCqlLibrary = {
  id: "622e1f46d1fd3729d861e6cb",
  cqlLibraryName: "TestCqlLibrary1",
  model: Model.QICORE,
  draft: false,
  createdAt: null,
  createdBy: null,
  lastModifiedAt: null,
  lastModifiedBy: null,
  librarySet: mockLibrarySet,
} as unknown as CqlLibrary;

jest.mock("@madie/madie-util", () => ({
  useFeatureFlags: jest.fn().mockReturnValue({
    LibraryReviewStatus: true,
  }),
  routeHandlerStore: {
    subscribe: () => {
      return { unsubscribe: () => null };
    },
    updateRouteHandlerState: () => null,
    state: { canTravel: true, pendingPath: "" },
    initialState: { canTravel: false, pendingPath: "" },
  },
  useCqlLibraryServiceApi: () => ({
    fetchAllLibraries: jest.fn().mockResolvedValue(["library1"]),
    fetchAllOwners: jest.fn().mockResolvedValue(["test user"]),
  }),
  useOktaTokens: () => ({
    getAccessToken: () => "test.jwt",
    getUserName: () => mockUser,
  }),
  useServiceConfig: () => ({
    cqlLibraryService: {
      baseUrl: "test-cql-library-service-url",
    },
  }),
  useUserRoles: jest.fn().mockReturnValue({ isAdmin: false, roles: [] }),
  checkUserCanEdit: jest
    .fn()
    .mockImplementationOnce(() => false)
    .mockImplementationOnce(() => true),
}));

describe("CqlLibraryActionCenter Component", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    routeHandlerStore.state = { canTravel: true, pendingPath: "" };
    (useUserRoles as jest.Mock).mockReturnValue({ isAdmin: false, roles: [] });
    (useFeatureFlags as jest.Mock).mockReturnValue({
      LibraryReviewStatus: true,
    });
    jest.spyOn(require("@madie/madie-util"), "useOktaTokens").mockReturnValue({
      getAccessToken: () => "test.jwt",
      getUserName: () => mockUser,
    });
  });
  it("renders the action center", () => {
    render(
      <CqlLibraryActionCenter
        canEdit={true}
        library={cqlLibrary}
        canDelete={false}
      />
    );
    expect(screen.getByTestId("action-center")).toBeInTheDocument();
  });

  it("should render delete and version library in action center when library is in draft status ", async () => {
    (checkUserCanEdit as jest.Mock).mockReturnValue(true);
    render(
      <CqlLibraryActionCenter
        canEdit={true}
        library={cqlLibrary}
        canDelete={true}
      />
    );
    const actionCenterButton = screen.getByTestId("action-center");
    await act(async () => {
      userEvent.click(actionCenterButton);
    });
    expect(screen.queryByTestId("DeleteLibrary")).toBeInTheDocument();
    expect(screen.queryByTestId("VersionLibrary")).toBeInTheDocument();
    expect(screen.queryByTestId("DraftLibrary")).not.toBeInTheDocument();
    expect(screen.queryByTestId("Transfer")).toBeInTheDocument();
  });

  it("should render draft library in action center when library is in versioned status ", () => {
    render(
      <CqlLibraryActionCenter
        canEdit={true}
        library={versionedCqlLibrary}
        canDelete={true}
      />
    );
    const actionCenterButton = screen.getByTestId("action-center");
    userEvent.click(actionCenterButton);
    expect(screen.queryByTestId("DraftLibrary")).toBeInTheDocument();
    expect(screen.queryByTestId("DeleteLibrary")).not.toBeInTheDocument();
    expect(screen.queryByTestId("VersionLibrary")).not.toBeInTheDocument();
  });

  it("should open action center on button click", async () => {
    (checkUserCanEdit as jest.Mock).mockReturnValue(true);
    render(
      <CqlLibraryActionCenter
        canEdit={true}
        library={versionedCqlLibrary}
        canDelete={true}
      />
    );
    const actionCenterButton = screen.getByLabelText("Library action center");
    await act(async () => {
      userEvent.click(actionCenterButton);
    });
    expect(screen.queryByTestId("DeleteLibrary")).not.toBeInTheDocument();
    expect(screen.queryByTestId("VersionLibrary")).not.toBeInTheDocument();
    expect(screen.queryByTestId("Transfer")).toBeInTheDocument();
    expect(screen.queryByTestId("ReviewLibrary")).toBeInTheDocument();
  });

  it("should trigger review-library event when 'Review Library' action is clicked", async () => {
    const dispatchEventSpy = jest.spyOn(window, "dispatchEvent");
    (checkUserCanEdit as jest.Mock).mockReturnValue(true);

    render(
      <CqlLibraryActionCenter
        canEdit={true}
        library={cqlLibrary}
        canDelete={true}
      />
    );

    const actionCenterButton = screen.getByLabelText("Library action center");
    await act(async () => {
      userEvent.click(actionCenterButton);
    });

    const reviewLibraryButton = screen.getByTestId("ReviewLibrary");
    await act(async () => {
      userEvent.click(reviewLibraryButton);
    });

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "review-library",
      })
    );
  });

  it("should not render 'Review Library' action when LibraryReviewStatus flag is disabled", async () => {
    (checkUserCanEdit as jest.Mock).mockReturnValue(true);
    (useFeatureFlags as jest.Mock).mockReturnValue({
      LibraryReviewStatus: false,
    });

    render(
      <CqlLibraryActionCenter
        canEdit={true}
        library={cqlLibrary}
        canDelete={true}
      />
    );

    const actionCenterButton = screen.getByLabelText("Library action center");
    await act(async () => {
      userEvent.click(actionCenterButton);
    });

    expect(screen.queryByTestId("ReviewLibrary")).not.toBeInTheDocument();
  });

  it("should render 'Delete Library' button only for draft libraries when canEdit is true", () => {
    render(
      <CqlLibraryActionCenter
        canEdit={true}
        library={cqlLibrary}
        canDelete={true}
      />
    );
    const actionCenterButton = screen.getByLabelText("Library action center");
    userEvent.click(actionCenterButton);
    expect(screen.getByTestId("DeleteLibrary")).toBeInTheDocument();
  });

  it("should render 'Version Library' button when canEdit is true and owner matches", async () => {
    (checkUserCanEdit as jest.Mock)
      .mockImplementationOnce(() => true) // ownerOfMeasure = false
      .mockImplementationOnce(() => false); // sharedWithUser = false
    render(
      <CqlLibraryActionCenter
        canEdit={true}
        library={cqlLibrary}
        canDelete={false}
      />
    );
    const actionCenterButton = screen.getByLabelText("Library action center");
    await act(async () => {
      userEvent.click(actionCenterButton);
    });
    const sharebutton = await screen.findByTestId("VersionLibrary");
    expect(sharebutton).toBeInTheDocument();
  });

  it("should not render 'Share Library' button when owner doesn't match", () => {
    jest.spyOn(require("@madie/madie-util"), "useOktaTokens").mockReturnValue({
      getAccessToken: () => "test.jwt",
      getUserName: () => "bad user",
    });
    render(
      <CqlLibraryActionCenter
        canEdit={true}
        library={cqlLibrary}
        canDelete={false}
      />
    );
    const actionCenterButton = screen.getByLabelText("Library action center");
    userEvent.click(actionCenterButton);
    expect(screen.queryByTestId("ShareLibrary")).not.toBeInTheDocument();
  });

  it("should not render 'Delete Library' button for versioned libraries", () => {
    render(
      <CqlLibraryActionCenter
        canEdit={true}
        library={versionedCqlLibrary}
        canDelete={true}
      />
    );
    const actionCenterButton = screen.getByLabelText("Library action center");
    userEvent.click(actionCenterButton);
    expect(screen.queryByTestId("DeleteLibrary")).not.toBeInTheDocument();
  });

  it("should trigger delete-library event when 'Delete Library' action is clicked", () => {
    const dispatchEventSpy = jest.spyOn(window, "dispatchEvent");
    render(
      <CqlLibraryActionCenter
        canEdit={true}
        library={cqlLibrary}
        canDelete={true}
      />
    );
    const actionCenterButton = screen.getByLabelText("Library action center");
    userEvent.click(actionCenterButton);
    const deleteLibraryButton = screen.getByTestId("DeleteLibrary");
    userEvent.click(deleteLibraryButton);
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "delete-library",
      })
    );
  });

  it("should trigger version-library event when 'Version Library' action is clicked", () => {
    const dispatchEventSpy = jest.spyOn(window, "dispatchEvent");
    render(
      <CqlLibraryActionCenter
        canEdit={true}
        library={cqlLibrary}
        canDelete={false}
      />
    );
    const actionCenterButton = screen.getByLabelText("Library action center");
    userEvent.click(actionCenterButton);
    const versionLibraryButton = screen.getByTestId("VersionLibrary");
    userEvent.click(versionLibraryButton);
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "version-library",
      })
    );
  });

  it("should trigger history-library event when 'History Library' action is clicked", () => {
    const dispatchEventSpy = jest.spyOn(window, "dispatchEvent");
    render(
      <CqlLibraryActionCenter
        canEdit={true}
        library={cqlLibrary}
        canDelete={false}
      />
    );
    const actionCenterButton = screen.getByLabelText("Library action center");
    userEvent.click(actionCenterButton);
    const historyLibrary = screen.getByTestId("History");
    userEvent.click(historyLibrary);
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "history-library",
      })
    );
  });

  it("should trigger draft-library event when 'Draft Library' action is clicked", () => {
    const dispatchEventSpy = jest.spyOn(window, "dispatchEvent");
    render(
      <CqlLibraryActionCenter
        canEdit={true}
        library={versionedCqlLibrary}
        canDelete={true}
      />
    );
    const actionCenterButton = screen.getByLabelText("Library action center");
    userEvent.click(actionCenterButton);
    const draftLibraryButton = screen.getByTestId("DraftLibrary");
    userEvent.click(draftLibraryButton);
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "draft-library",
      })
    );
  });

  it("pops discard dialog, emits event for resetting forms on continue", async () => {
    routeHandlerStore.state.canTravel = false;
    const dispatchEventSpy = jest.spyOn(window, "dispatchEvent");
    render(
      <CqlLibraryActionCenter
        canEdit={true}
        library={cqlLibrary}
        canDelete={true}
      />
    );

    const actionCenterButton = screen.getByLabelText("Library action center");
    userEvent.click(actionCenterButton);

    const saveButton = screen.getByTestId("DeleteLibrary");
    expect(saveButton).toBeInTheDocument();
    userEvent.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByTestId("discard-dialog-continue-button")
      ).toBeInTheDocument();
      userEvent.click(screen.getByTestId("discard-dialog-continue-button"));
    });

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({ isTrusted: false })
    );
  });

  it("should not display transfer icon when user is not the owner and not an admin", async () => {
    (checkUserCanEdit as jest.Mock).mockReturnValue(false);
    jest.spyOn(require("@madie/madie-util"), "useOktaTokens").mockReturnValue({
      getAccessToken: () => "test.jwt",
      getUserName: () => "bad user",
    });
    render(
      <CqlLibraryActionCenter
        canEdit={true}
        library={cqlLibrary}
        canDelete={true}
      />
    );
    const actionCenterButton = screen.getByLabelText("Library action center");
    await act(async () => {
      userEvent.click(actionCenterButton);
    });
    expect(screen.queryByTestId("Transfer")).not.toBeInTheDocument();
  });

  it("should trigger transfer library event", async () => {
    const dispatchEventSpy = jest.spyOn(window, "dispatchEvent");
    (checkUserCanEdit as jest.Mock).mockReturnValue(true);

    render(
      <CqlLibraryActionCenter
        canEdit={true}
        library={cqlLibrary}
        canDelete={true}
      />
    );

    const actionCenterButton = screen.getByLabelText("Library action center");
    await act(async () => {
      userEvent.click(actionCenterButton);
    });

    const transferLibraryBtn = screen.getByTestId("Transfer");
    expect(transferLibraryBtn).toBeInTheDocument();
    expect(transferLibraryBtn).toBeEnabled();

    await act(async () => {
      userEvent.click(transferLibraryBtn);
    });

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "transfer-library",
      })
    );
  });

  it("should trigger transfer library when the user is an admin but not the owner", async () => {
    const dispatchEventSpy = jest.spyOn(window, "dispatchEvent");
    (checkUserCanEdit as jest.Mock).mockReturnValue(false);
    (useUserRoles as jest.Mock).mockReturnValue({
      isAdmin: true,
      roles: ["MADiE-admin"],
    });

    render(
      <CqlLibraryActionCenter
        canEdit={false}
        library={cqlLibrary}
        canDelete={false}
      />
    );

    const actionCenterButton = screen.getByLabelText("Library action center");
    await act(async () => {
      userEvent.click(actionCenterButton);
    });

    const transferLibraryBtn = screen.getByTestId("Transfer");
    expect(transferLibraryBtn).toBeInTheDocument();
    expect(transferLibraryBtn).toBeEnabled();

    await act(async () => {
      userEvent.click(transferLibraryBtn);
    });

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "transfer-library",
      })
    );
  });

  it("should render 'Unshare' menu option when action is 'UnShare Library From Me'", async () => {
    (checkUserCanEdit as jest.Mock).mockImplementation((owner, acls) => {
      if (owner) return false;
      return !!acls;
    });

    const sharedLibrary = {
      ...cqlLibrary,
      librarySet: {
        ...mockLibrarySet,
        owner: "someone-else",
        acls: ["test-acl"],
      },
    } as unknown as CqlLibrary;

    render(
      <CqlLibraryActionCenter
        canEdit={true}
        library={sharedLibrary}
        canDelete={true}
      />
    );
    const actionCenterButton = screen.getByLabelText("Library action center");
    userEvent.click(actionCenterButton);

    const unshareBtn = await screen.findByTestId("UnShareLibraryFromMe");
    userEvent.click(unshareBtn);

    expect(screen.queryByTestId("Share With-option")).not.toBeInTheDocument();
  });

  it("renders disabled Delete and Version button when locked", () => {
    render(
      <CqlLibraryActionCenter
        canEdit={true}
        canDelete={true}
        library={cqlLibrary}
        libraryLockedBy="user1"
      />
    );
    const actionCenterButton = screen.getByLabelText("Library action center");
    userEvent.click(actionCenterButton);

    const disabledDeleteBtn = screen.getByTestId("deleteDisabled");
    expect(disabledDeleteBtn).toBeDefined(); // Ensure a disabled button is found
    expect(disabledDeleteBtn).toBeDisabled();

    const disabledVersionBtn = screen.getByTestId("versionDisabled");
    expect(disabledVersionBtn).toBeDefined(); // Ensure a disabled button is found
    expect(disabledVersionBtn).toBeDisabled();
  });

  it("dispatches 'share-library' event when 'Share With' menu item is clicked", async () => {
    (checkUserCanEdit as jest.Mock).mockReturnValue(true);
    const dispatchEventSpy = jest.spyOn(window, "dispatchEvent");
    render(
      <CqlLibraryActionCenter
        canEdit={true}
        library={cqlLibrary}
        canDelete={true}
      />
    );

    const actionCenterButton = screen.getByLabelText("Library action center");
    await act(async () => {
      userEvent.click(actionCenterButton);
    });

    const shareAction = await screen.findByTestId("ShareLibrary");
    await act(async () => {
      userEvent.click(shareAction);
    });

    await waitFor(() => {
      expect(screen.getByTestId("share-menu")).toBeInTheDocument();
    });

    await act(async () => {
      userEvent.click(screen.getByTestId("Share With-option"));
    });

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: "share-library" })
    );
  });

  it("dispatches 'unshare-library' event when 'Unshare' menu item is clicked", async () => {
    (checkUserCanEdit as jest.Mock).mockReturnValue(true);
    const dispatchEventSpy = jest.spyOn(window, "dispatchEvent");
    render(
      <CqlLibraryActionCenter
        canEdit={true}
        library={cqlLibrary}
        canDelete={true}
      />
    );

    const actionCenterButton = screen.getByLabelText("Library action center");
    await act(async () => {
      userEvent.click(actionCenterButton);
    });

    const shareAction = await screen.findByTestId("ShareLibrary");
    await act(async () => {
      userEvent.click(shareAction);
    });

    await waitFor(() => {
      expect(screen.getByTestId("share-menu")).toBeInTheDocument();
    });

    await act(async () => {
      userEvent.click(screen.getByTestId("Unshare-option"));
    });

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: "unshare-library" })
    );
  });

  it("should render and handle 'Unshare' menu option when action is 'UnShare Library From Me'", async () => {
    (checkUserCanEdit as jest.Mock).mockImplementation((owner, acls) => {
      if (owner) return false;
      return !!acls;
    });

    const dispatchEventSpy = jest.spyOn(window, "dispatchEvent");

    const sharedLibrary = {
      ...cqlLibrary,
      librarySet: {
        ...mockLibrarySet,
        owner: "someone-else",
        acls: ["test-acl"],
      },
    } as unknown as CqlLibrary;

    render(
      <CqlLibraryActionCenter
        canEdit={true}
        library={sharedLibrary}
        canDelete={true}
      />
    );

    // Open the SpeedDial
    const actionCenterButton = screen.getByLabelText("Library action center");
    userEvent.click(actionCenterButton);

    // Click the 'UnShare Library From Me' action
    const unshareAction = await screen.findByTestId("UnShareLibraryFromMe");
    userEvent.click(unshareAction);

    // Wait for the menu to appear
    await waitFor(() => expect(screen.getByTestId("share-menu")).toBeVisible());

    // Ensure the menu item is present before clicking
    const unshareMenuItem = await screen.findByTestId(
      "Unshare-library-from-me-option"
    );
    expect(unshareMenuItem).toBeInTheDocument();
    userEvent.click(unshareMenuItem);

    // Wait for the menu to close
    await waitFor(() => {
      expect(screen.queryByTestId("share-menu")).not.toBeInTheDocument();
    });

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: "unshare-library-from-me" })
    );
  });
});

describe("Admin user share library", () => {
  beforeEach(() => {
    (useUserRoles as jest.Mock).mockReturnValue({
      isAdmin: true,
      roles: ["MADiE-admin"],
    });
  });

  it("should render and handle 'Share' menu option when action is 'Share Library'", async () => {
    (checkUserCanEdit as jest.Mock).mockImplementation((owner, acls) => {
      if (owner) return false;
      return !!acls;
    });

    const dispatchEventSpy = jest.spyOn(window, "dispatchEvent");

    render(
      <CqlLibraryActionCenter
        canEdit={true}
        library={cqlLibrary}
        canDelete={true}
      />
    );

    const actionCenterButton = screen.getByLabelText("Library action center");
    await act(async () => {
      userEvent.click(actionCenterButton);
    });

    const shareAction = await screen.findByTestId("Share/Unshare");
    await act(async () => {
      userEvent.click(shareAction);
    });

    await waitFor(() => {
      expect(screen.getByTestId("share-menu")).toBeInTheDocument();
    });

    await act(async () => {
      userEvent.click(screen.getByTestId("Share With-option"));
    });

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: "share-library" })
    );
  });
});
