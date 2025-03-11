import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import MeasureActionCenter from "./MeasureActionCenter";
import { Measure } from "@madie/madie-models";
import userEvent from "@testing-library/user-event";
import { useFeatureFlags, routeHandlerStore } from "@madie/madie-util";

const draftMeasure = {
  id: "measure ID",
  createdBy: "testuser@example.com",
  model: "QI-Core v4.1.1",
  measureMetaData: { draft: true },
} as Measure;

const versionedMeasure = {
  id: "measure ID",
  createdBy: "testuser@example.com",
  model: "QI-Core v4.1.1",
  measureMetaData: { draft: false },
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
}));

describe("MeasureActionCenter Component", () => {
  it("renders the action center", () => {
    render(<MeasureActionCenter canEdit={true} measure={draftMeasure} />);
    expect(screen.getByTestId("action-center")).toBeInTheDocument();
  });

  it("should open action center on button click", () => {
    (useFeatureFlags as jest.Mock).mockReturnValue({ ShareMeasure: true });
    render(<MeasureActionCenter canEdit={true} measure={versionedMeasure} />);
    const actionCenterButton = screen.getByLabelText("Measure action center");
    userEvent.click(actionCenterButton);
    expect(screen.queryByTestId("DeleteMeasure")).not.toBeInTheDocument();
    expect(screen.queryByTestId("VersionMeasure")).not.toBeInTheDocument();
    expect(screen.getByTestId("Share/Unshare")).toBeInTheDocument();
    expect(screen.getByTestId("DraftMeasure")).toBeInTheDocument();
    expect(screen.getByTestId("ExportMeasure")).toBeInTheDocument();
    expect(screen.getByTestId("Viewhumanreadable")).toBeInTheDocument();
  });

  it("should render 'Delete Measure' button only for draft measures when canEdit is true", () => {
    render(<MeasureActionCenter canEdit={true} measure={draftMeasure} />);
    const actionCenterButton = screen.getByLabelText("Measure action center");
    userEvent.click(actionCenterButton);
    expect(screen.getByTestId("DeleteMeasure")).toBeInTheDocument();
  });

  it("should not render 'Delete Measure' button for versioned measures", () => {
    render(<MeasureActionCenter canEdit={true} measure={versionedMeasure} />);
    const actionCenterButton = screen.getByLabelText("Measure action center");
    userEvent.click(actionCenterButton);
    expect(screen.queryByTestId("DeleteMeasure")).not.toBeInTheDocument();
  });

  it("should trigger delete-measure event when 'Delete Measure' action is clicked", () => {
    const dispatchEventSpy = jest.spyOn(window, "dispatchEvent");
    render(<MeasureActionCenter canEdit={true} measure={draftMeasure} />);
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

  it("should trigger export-measure event when 'Export Measure' action is clicked", () => {
    const dispatchEventSpy = jest.spyOn(window, "dispatchEvent");
    render(<MeasureActionCenter canEdit={true} measure={draftMeasure} />);
    const actionCenterButton = screen.getByLabelText("Measure action center");
    userEvent.click(actionCenterButton);
    const exportMeasureButton = screen.getByTestId("ExportMeasure");
    userEvent.click(exportMeasureButton);
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "export-measure",
      })
    );
  });

  it("should display discard dialog when a user has unsaved changes", () => {
    const dispatchEventSpy = jest.spyOn(window, "dispatchEvent");
    render(<MeasureActionCenter canEdit={true} measure={draftMeasure} />);
    const actionCenterButton = screen.getByLabelText("Measure action center");
    userEvent.click(actionCenterButton);
    const exportMeasureButton = screen.getByTestId("ExportMeasure");
    userEvent.click(exportMeasureButton);
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "export-measure",
      })
    );
  });

  it("should trigger view-humanreadable event when 'View human readable' action is clicked", () => {
    const dispatchEventSpy = jest.spyOn(window, "dispatchEvent");
    render(<MeasureActionCenter canEdit={true} measure={draftMeasure} />);
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

  it("should trigger share-measure event when 'Share With' action is clicked", () => {
    const dispatchEventSpy = jest.spyOn(window, "dispatchEvent");
    render(<MeasureActionCenter canEdit={true} measure={draftMeasure} />);

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
    const dispatchEventSpy = jest.spyOn(window, "dispatchEvent");
    render(<MeasureActionCenter canEdit={true} measure={draftMeasure} />);

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
    routeHandlerStore.state.canTravel = false;
    const dispatchEventSpy = jest.spyOn(window, "dispatchEvent");
    render(<MeasureActionCenter canEdit={true} measure={draftMeasure} />);

    const actionCenterButton = screen.getByLabelText("Measure action center");
    userEvent.click(actionCenterButton);

    const saveButton = screen.getByTestId("Savemeasuretoviewhumanreadable");
    expect(saveButton).toBeInTheDocument();
    userEvent.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByTestId("discard-dialog-continue-button")
      ).toBeInTheDocument();
      userEvent.click(screen.getByTestId("discard-dialog-continue-button"));
    });

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "resetAllForms",
      })
    );
  });
});
