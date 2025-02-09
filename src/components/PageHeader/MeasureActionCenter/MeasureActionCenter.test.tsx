import * as React from "react";
import { render, screen } from "@testing-library/react";
import MeasureActionCenter from "./MeasureActionCenter";
import { Measure } from "@madie/madie-models";
import userEvent from "@testing-library/user-event";

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

describe("MeasureActionCenter Component", () => {
  it("renders the action center", () => {
    render(<MeasureActionCenter canEdit={true} measure={draftMeasure} />);
    expect(screen.getByTestId("action-center")).toBeInTheDocument();
  });

  it("should open action center on button click", () => {
    render(<MeasureActionCenter canEdit={true} measure={versionedMeasure} />);
    const actionCenterButton = screen.getByLabelText("Measure action center");
    userEvent.click(actionCenterButton);
    expect(screen.queryByTestId("DeleteMeasure")).not.toBeInTheDocument();
    expect(screen.queryByTestId("VersionMeasure")).not.toBeInTheDocument();
    expect(screen.getByTestId("ShareMeasure")).toBeInTheDocument();
    expect(screen.getByTestId("DraftMeasure")).toBeInTheDocument();
    expect(screen.getByTestId("ExportMeasure")).toBeInTheDocument();
    expect(screen.getByTestId("Viewhumanreadable")).toBeInTheDocument();
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
});
