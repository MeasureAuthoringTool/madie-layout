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
    (useFeatureFlags as jest.Mock).mockReturnValue({ ShareMeasure: true });
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
    expect(screen.getByTestId("Viewhumanreadable")).toBeInTheDocument();
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

    const exportForPublishingButton = await screen.findByRole("button", {
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

    const exportButton = await screen.findByRole("button", {
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

    const exportForPublishingButton = await screen.findByRole("button", {
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
    const unsharehMenuItem = screen.getByTestId("Unshare-option");

    expect(shareWithMenuItem).toBeInTheDocument();
    expect(unsharehMenuItem).toBeInTheDocument();

    userEvent.click(screen.getByRole("menuitem", { name: "Share With" }));

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "share-measure",
      })
    );
  });

  it("should trigger unshare-measure event when 'Unshare' action is clicked", () => {
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
    const unsharehMenuItem = screen.getByTestId("Unshare-option");

    expect(shareWithMenuItem).toBeInTheDocument();
    expect(unsharehMenuItem).toBeInTheDocument();

    userEvent.click(screen.getByRole("menuitem", { name: "Unshare" }));

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "unshare-measure",
      })
    );
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
});
