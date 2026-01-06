import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import MeasureActionCenter from "./MeasureActionCenter";
import { Measure, MeasureSet } from "@madie/madie-models";
import userEvent from "@testing-library/user-event";
import {
  useFeatureFlags,
  routeHandlerStore,
  checkUserCanEdit,
} from "@madie/madie-util";

const mockMeasureSet = {
  cmsId: "124",
  measureSetId: "1-2-3-4",
  owner: "testuser@example.com",
} as unknown as MeasureSet;

const draftMeasure = {
  id: "measure ID",
  createdBy: "testuser@example.com",
  model: "QI-Core v4.1.1",
  measureMetaData: { draft: true },
  measureSet: mockMeasureSet,
} as Measure;

const versionedMeasure = {
  id: "measure ID",
  createdBy: "testuser@example.com",
  model: "QI-Core v4.1.1",
  measureMetaData: { draft: false },
  measureSet: mockMeasureSet,
} as Measure;

jest.mock("@madie/madie-util", () => ({
  useFeatureFlags: jest.fn().mockReturnValue({}),
  routeHandlerStore: {
    subscribe: () => {
      return { unsubscribe: () => null };
    },
    updateRouteHandlerState: () => null,
    state: { canTravel: true, pendingPath: "" },
    initialState: { canTravel: false, pendingPath: "" },
  },
  checkUserCanEdit: jest.fn().mockImplementation(() => true),
}));

describe("MeasureActionCenter Component", () => {
  let dispatchEventSpy: jest.SpyInstance<boolean, [event: Event]>;

  beforeEach(() => {
    dispatchEventSpy = jest.spyOn(window, "dispatchEvent");
  });

  afterEach(() => {
    dispatchEventSpy.mockRestore();
  });

  it("renders the action center", () => {
    render(
      <MeasureActionCenter
        canEdit={true}
        measure={draftMeasure}
        canDelete={false}
      />
    );
    expect(screen.getByTestId("action-center")).toBeInTheDocument();
  });

  it("should open action center on button click", () => {
    (useFeatureFlags as jest.Mock).mockReturnValue({
      ShareMeasure: true,
    });
    render(
      <MeasureActionCenter
        canEdit={true}
        measure={versionedMeasure}
        canDelete={true}
      />
    );
    const actionCenterButton = screen.getByLabelText("Measure action center");
    userEvent.click(actionCenterButton);
    expect(screen.queryByTestId("DeleteMeasure")).not.toBeInTheDocument();
    expect(screen.queryByTestId("VersionMeasure")).not.toBeInTheDocument();
    expect(screen.getByTestId("Share/Unshare")).toBeInTheDocument();
    const draftMeasureBtn = screen.getByTestId("DraftMeasure");
    expect(draftMeasureBtn).toBeInTheDocument();
    expect(screen.getByTestId("ExportMeasure")).toBeInTheDocument();
    expect(screen.getByTestId("Viewhumanreadable")).toBeInTheDocument();
    expect(screen.getByTestId("ViewHistory")).toBeInTheDocument();
    expect(screen.getByTestId("Transfer")).toBeInTheDocument();

    userEvent.click(draftMeasureBtn);
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "draft-measure",
      })
    );
  });

  it("should trigger transfer measure event", () => {
    render(
      <MeasureActionCenter
        canEdit={true}
        measure={versionedMeasure}
        canDelete={true}
      />
    );

    const actionCenterButton = screen.getByLabelText("Measure action center");
    userEvent.click(actionCenterButton);
    expect(screen.queryByTestId("DeleteMeasure")).not.toBeInTheDocument();
    expect(screen.queryByTestId("VersionMeasure")).not.toBeInTheDocument();
    expect(screen.getByTestId("Share/Unshare")).toBeInTheDocument();
    expect(screen.getByTestId("DraftMeasure")).toBeInTheDocument();
    expect(screen.getByTestId("ExportMeasure")).toBeInTheDocument();
    expect(screen.getByTestId("Transfer")).toBeInTheDocument();
    const transferMeasureBtn = screen.getByTestId("transfer-action-btn");
    expect(transferMeasureBtn).toBeInTheDocument();
    expect(transferMeasureBtn).toBeEnabled();

    userEvent.click(transferMeasureBtn);

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "transfer-measure",
      })
    );
  });

  it("should render 'Delete Measure' button only for draft measures and user has delete right when canEdit is true", () => {
    render(
      <MeasureActionCenter
        canEdit={true}
        measure={draftMeasure}
        canDelete={true}
      />
    );
    const actionCenterButton = screen.getByLabelText("Measure action center");
    userEvent.click(actionCenterButton);
    expect(screen.getByTestId("DeleteMeasure")).toBeInTheDocument();
  });

  it("should not render 'Delete Measure' button for versioned measures", () => {
    render(
      <MeasureActionCenter
        canEdit={true}
        measure={versionedMeasure}
        canDelete={true}
      />
    );
    const actionCenterButton = screen.getByLabelText("Measure action center");
    userEvent.click(actionCenterButton);
    expect(screen.queryByTestId("DeleteMeasure")).not.toBeInTheDocument();
  });

  it("should trigger delete-measure event when 'Delete Measure' action is clicked", () => {
    render(
      <MeasureActionCenter
        canEdit={true}
        measure={draftMeasure}
        canDelete={true}
      />
    );
    const actionCenterButton = screen.getByLabelText("Measure action center");
    userEvent.click(actionCenterButton);
    const deleteMeasureButton = screen.getByTestId("DeleteMeasure");
    userEvent.click(deleteMeasureButton);
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "delete-measure",
      })
    );
  });

  it("should render 'Version Measure' button only for draft measures when canEdit is true", () => {
    render(
      <MeasureActionCenter
        canEdit={true}
        measure={draftMeasure}
        canDelete={false}
      />
    );
    const actionCenterButton = screen.getByLabelText("Measure action center");
    userEvent.click(actionCenterButton);
    expect(screen.getByTestId("VersionMeasure")).toBeInTheDocument();
  });

  it("should not render 'Version Measure' button for versioned measures", () => {
    render(
      <MeasureActionCenter
        canEdit={true}
        measure={versionedMeasure}
        canDelete={false}
      />
    );
    const actionCenterButton = screen.getByLabelText("Measure action center");
    userEvent.click(actionCenterButton);
    expect(screen.queryByTestId("VersionMeasure")).not.toBeInTheDocument();
  });

  it("should trigger version-measure event when 'Version Measure' action is clicked", () => {
    render(
      <MeasureActionCenter
        canEdit={true}
        measure={draftMeasure}
        canDelete={false}
      />
    );
    const actionCenterButton = screen.getByLabelText("Measure action center");
    userEvent.click(actionCenterButton);
    const versionMeasureButton = screen.getByTestId("VersionMeasure");
    userEvent.click(versionMeasureButton);
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "version-measure",
      })
    );
  });

  it("should trigger export-measure event when 'Export Measure For Publishing' action is clicked", async () => {
    render(
      <MeasureActionCenter
        canEdit={true}
        measure={draftMeasure}
        canDelete={false}
      />
    );
    const actionCenterButton = screen.getByLabelText("Measure action center");
    userEvent.click(actionCenterButton);

    const exportIcon = screen.getByTestId("export-action-btn");
    userEvent.click(exportIcon);

    const exportForPublishingButton = await screen.findByRole("menuitem", {
      name: "Export for Publishing",
    });
    userEvent.click(exportForPublishingButton);

    const event = dispatchEventSpy.mock.calls[0][0] as CustomEvent;
    expect(event).toBeInstanceOf(CustomEvent);
    expect(event.detail).toEqual({ elmErrorSeverity: "Error" });
    expect(event.type).toEqual("export-measure");
  });

  it("should trigger export-measure event when 'Export Measure' action is clicked", async () => {
    render(
      <MeasureActionCenter
        canEdit={true}
        measure={draftMeasure}
        canDelete={false}
      />
    );
    const actionCenterButton = screen.getByLabelText("Measure action center");
    userEvent.click(actionCenterButton);

    const exportIcon = screen.getByTestId("export-action-btn");
    userEvent.click(exportIcon);

    const exportButton = await screen.findByRole("menuitem", {
      name: "Export",
    });
    userEvent.click(exportButton);

    const event = dispatchEventSpy.mock.calls[0][0] as CustomEvent;
    expect(event).toBeInstanceOf(CustomEvent);
    expect(event.detail).toEqual({ elmErrorSeverity: "Info" });
    expect(event.type).toEqual("export-measure");
  });

  it("should display discard dialog when a user has unsaved changes", async () => {
    render(
      <MeasureActionCenter
        canEdit={true}
        measure={draftMeasure}
        canDelete={false}
      />
    );
    const actionCenterButton = screen.getByLabelText("Measure action center");
    userEvent.click(actionCenterButton);

    const exportIcon = screen.getByTestId("export-action-btn");
    userEvent.click(exportIcon);

    const exportForPublishingButton = await screen.findByRole("menuitem", {
      name: "Export for Publishing",
    });

    userEvent.click(exportForPublishingButton);
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "export-measure",
      })
    );
  });

  it("should trigger view-humanreadable event when 'View human readable' action is clicked", () => {
    render(
      <MeasureActionCenter
        canEdit={true}
        measure={draftMeasure}
        canDelete={false}
      />
    );
    const actionCenterButton = screen.getByLabelText("Measure action center");
    userEvent.click(actionCenterButton);
    const viewHRButton = screen.getByTestId("Viewhumanreadable");
    userEvent.click(viewHRButton);
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "view-humanreadable",
      })
    );
  });

  it("should render View History button", () => {
    render(
      <MeasureActionCenter
        canEdit={true}
        measure={draftMeasure}
        canDelete={false}
      />
    );
    const actionCenterButton = screen.getByLabelText("Measure action center");
    userEvent.click(actionCenterButton);
    const viewHistoryButton = screen.getByTestId("ViewHistory");
    expect(viewHistoryButton).toBeInTheDocument();
  });

  it("should render Share button if the user is the owner of the measure", () => {
    (useFeatureFlags as jest.Mock).mockReturnValue({ ShareMeasure: true });
    render(
      <MeasureActionCenter
        canEdit={true}
        measure={draftMeasure}
        canDelete={false}
      />
    );
    const actionCenterButton = screen.getByLabelText("Measure action center");
    userEvent.click(actionCenterButton);
    expect(screen.getByTestId("Share/Unshare")).toBeInTheDocument();
  });

  it("should not render Share button if the user is not the owner of the measure", () => {
    (useFeatureFlags as jest.Mock).mockReturnValue({ ShareMeasure: true });
    (checkUserCanEdit as jest.Mock).mockImplementationOnce(() => false);
    render(
      <MeasureActionCenter
        canEdit={true}
        measure={draftMeasure}
        canDelete={false}
      />
    );
    const actionCenterButton = screen.getByLabelText("Measure action center");
    userEvent.click(actionCenterButton);

    const shareButton = screen.queryByTestId("Share/Unshare");
    expect(shareButton).toBeNull();
  });

  it("should trigger share-measure event when 'Share With' action is clicked", () => {
    (useFeatureFlags as jest.Mock).mockReturnValue({ ShareMeasure: true });
    render(
      <MeasureActionCenter
        canEdit={true}
        measure={draftMeasure}
        canDelete={false}
      />
    );

    const actionCenterButton = screen.getByLabelText("Measure action center");
    userEvent.click(actionCenterButton);

    const shareButton = screen.getByTestId("share-action-btn");
    userEvent.click(shareButton);

    const shareWithMenuItem = screen.getByTestId("Share With-option");
    const unshareMenuItem = screen.getByTestId("Unshare-option");

    expect(shareWithMenuItem).toBeInTheDocument();
    expect(unshareMenuItem).toBeInTheDocument();

    userEvent.click(screen.getByRole("menuitem", { name: "Share With" }));

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "share-measure",
      })
    );
  });

  it("should trigger unshare-measure event when 'Unshare' action is clicked", () => {
    (useFeatureFlags as jest.Mock).mockReturnValue({ ShareMeasure: true });
    render(
      <MeasureActionCenter
        canEdit={true}
        measure={draftMeasure}
        canDelete={false}
      />
    );

    const actionCenterButton = screen.getByLabelText("Measure action center");
    userEvent.click(actionCenterButton);

    const shareButton = screen.getByTestId("share-action-btn");
    userEvent.click(shareButton);

    const shareWithMenuItem = screen.getByTestId("Share With-option");
    const unshareMenuItem = screen.getByTestId("Unshare-option");

    expect(shareWithMenuItem).toBeInTheDocument();
    expect(unshareMenuItem).toBeInTheDocument();

    userEvent.click(screen.getByRole("menuitem", { name: "Unshare" }));

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "unshare-measure",
      })
    );
  });

  it("should render Unshare from me button when measure is shared with user but they are not owner", async () => {
    // User is not the owner of measure but the measure shared with them
    (checkUserCanEdit as jest.Mock)
      .mockImplementationOnce(() => false) // ownerOfMeasure = false
      .mockImplementationOnce(() => true); // sharedWithUser = true

    render(
      <MeasureActionCenter
        canEdit={true}
        measure={draftMeasure}
        canDelete={false}
      />
    );

    const actionCenterButton = screen.getByLabelText("Measure action center");
    userEvent.click(actionCenterButton);

    const shareActionButton = screen.getByTestId("share-action-btn");
    expect(shareActionButton).toBeInTheDocument();

    userEvent.click(shareActionButton);

    expect(screen.queryByTestId("Share With-option")).toBeNull();
    const unshareMenuItem = await screen.findByTestId("Unshare-option");
    expect(unshareMenuItem).toBeInTheDocument();

    userEvent.click(unshareMenuItem);

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "unshare-measure-from-me",
      })
    );
  });

  it("should not render Share/Unshare or Unshare from me button when user is not owner and measure is not shared with them", () => {
    (checkUserCanEdit as jest.Mock)
      .mockImplementationOnce(() => false) // ownerOfMeasure = false
      .mockImplementationOnce(() => false); // sharedWithUser = false

    render(
      <MeasureActionCenter
        canEdit={true}
        measure={draftMeasure}
        canDelete={false}
      />
    );

    const actionCenterButton = screen.getByLabelText("Measure action center");
    userEvent.click(actionCenterButton);

    const shareActionButton = screen.queryByTestId("share-action-btn");
    expect(shareActionButton).toBeNull();
  });

  it("pops discard dialog, emits event for resetting forms on continue", async () => {
    const setTimeoutSpy = jest.spyOn(global, "setTimeout");
    routeHandlerStore.state.canTravel = false;
    render(
      <MeasureActionCenter
        canEdit={true}
        measure={draftMeasure}
        canDelete={false}
      />
    );

    const actionCenterButton = screen.getByLabelText("Measure action center");
    userEvent.click(actionCenterButton);

    const saveButton = screen.getByTestId("Savemeasuretoviewhumanreadable");
    expect(saveButton).toBeInTheDocument();
    userEvent.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByTestId("discard-dialog-continue-button")
      ).toBeInTheDocument();
    });

    userEvent.click(screen.getByTestId("discard-dialog-continue-button"));

    // Wait for the timeout to complete
    await new Promise((resolve) => setTimeout(resolve, 350));

    // Assert that the timeout was called
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 350);

    // Assert that the event was dispatched after the timeout
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "resetAllForms",
      })
    );

    setTimeoutSpy.mockRestore();
  });

  it("should not display Transfer Measure when measure has a different owner", () => {
    const measureSet = { ...mockMeasureSet, owner: "anotherUser" };
    const measure = { ...draftMeasure, measureSet: measureSet };
    (useFeatureFlags as jest.Mock).mockReturnValueOnce({
      ShareMeasure: true,
    });
    (checkUserCanEdit as jest.Mock).mockReturnValueOnce(false); // User is not the owner
    render(
      <MeasureActionCenter canEdit={true} measure={measure} canDelete={true} />
    );

    const actionCenterButton = screen.getByLabelText("Measure action center");
    userEvent.click(actionCenterButton);
    expect(screen.getByTestId("ExportMeasure")).toBeInTheDocument();
    expect(screen.queryByTestId("Transfer")).not.toBeInTheDocument();
  });

  it("should render 'View History' action", () => {
    render(
      <MeasureActionCenter
        canEdit={true}
        measure={draftMeasure}
        canDelete={false}
      />
    );
    const actionCenterButton = screen.getByLabelText("Measure action center");
    userEvent.click(actionCenterButton);
    expect(screen.getByTestId("ViewHistory")).toBeInTheDocument();
  });

  it("should dispatch 'view-measure-history' event when 'View History' action is clicked", () => {
    const dispatchEventSpy = jest.spyOn(window, "dispatchEvent");
    render(
      <MeasureActionCenter
        canEdit={true}
        measure={draftMeasure}
        canDelete={false}
      />
    );
    const actionCenterButton = screen.getByLabelText("Measure action center");
    userEvent.click(actionCenterButton);
    const viewHistoryButton = screen.getByTestId("ViewHistory");
    userEvent.click(viewHistoryButton);
    expect(screen.getByTestId("ViewHistory")).toBeInTheDocument();
  });

  it("renders disabled Delete button when locked", () => {
    render(
      <MeasureActionCenter
        canEdit={true}
        canDelete={true}
        measure={draftMeasure}
        measureLockedBy="user1"
      />
    );
    userEvent.click(screen.getByLabelText("Measure action center"));

    const disabledDeleteBtn = screen.getByTestId("deleteDisabled");
    expect(disabledDeleteBtn).toBeDefined(); // Ensure a disabled button is found
    expect(disabledDeleteBtn).toBeDisabled();

    const disabledVersionBtn = screen.getByTestId("versionDisabled");
    expect(disabledVersionBtn).toBeDefined(); // Ensure a disabled button is found
    expect(disabledVersionBtn).toBeDisabled();
  });
});
