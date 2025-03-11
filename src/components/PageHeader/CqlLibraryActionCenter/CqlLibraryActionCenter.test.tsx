import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import CqlLibraryActionCenter from "./CqlLibraryActionCenter";
import { CqlLibrary, Model } from "@madie/madie-models";
import userEvent from "@testing-library/user-event";
import { routeHandlerStore } from "@madie/madie-util";

const cqlLibrary = {
  id: "622e1f46d1fd3729d861e6cb",
  cqlLibraryName: "TestCqlLibrary1",
  model: Model.QICORE,
  draft: true,
  createdAt: null,
  createdBy: null,
  lastModifiedAt: null,
  lastModifiedBy: null,
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
} as unknown as CqlLibrary;

jest.mock("@madie/madie-util", () => ({
  routeHandlerStore: {
    subscribe: () => {
      return { unsubscribe: () => null };
    },
    updateRouteHandlerState: () => null,
    state: { canTravel: true, pendingPath: "" },
    initialState: { canTravel: false, pendingPath: "" },
  },
}));

describe("CqlLibraryActionCenter Component", () => {
  it("renders the action center", () => {
    render(<CqlLibraryActionCenter canEdit={true} library={cqlLibrary} />);
    expect(screen.getByTestId("action-center")).toBeInTheDocument();
  });

  it("should render delete and version library in action center when library is in draft status ", () => {
    render(<CqlLibraryActionCenter canEdit={true} library={cqlLibrary} />);
    const actionCenterButton = screen.getByTestId("action-center");
    userEvent.click(actionCenterButton);
    expect(screen.queryByTestId("DeleteLibrary")).toBeInTheDocument();
    expect(screen.queryByTestId("VersionLibrary")).toBeInTheDocument();
    expect(screen.queryByTestId("DraftLibrary")).not.toBeInTheDocument();
  });

  it("should render draft library in action center when library is in versioned status ", () => {
    render(<CqlLibraryActionCenter canEdit={true} library={versionedCqlLibrary} />);
    const actionCenterButton = screen.getByTestId("action-center");
    userEvent.click(actionCenterButton);
    expect(screen.queryByTestId("DraftLibrary")).toBeInTheDocument();
    expect(screen.queryByTestId("DeleteLibrary")).not.toBeInTheDocument();
    expect(screen.queryByTestId("VersionLibrary")).not.toBeInTheDocument();
  });

  it("should open action center on button click", () => {
    render(
      <CqlLibraryActionCenter canEdit={true} library={versionedCqlLibrary} />
    );
    const actionCenterButton = screen.getByLabelText("Library action center");
    userEvent.click(actionCenterButton);
    expect(screen.queryByTestId("DeleteLibrary")).not.toBeInTheDocument();
    expect(screen.queryByTestId("VersionLibrary")).not.toBeInTheDocument();
  });

  it("should render 'Delete Library' button only for draft libraries when canEdit is true", () => {
    render(<CqlLibraryActionCenter canEdit={true} library={cqlLibrary} />);
    const actionCenterButton = screen.getByLabelText("Library action center");
    userEvent.click(actionCenterButton);
    expect(screen.getByTestId("DeleteLibrary")).toBeInTheDocument();
  });

  it("should not render 'Delete Library' button for versioned libraries", () => {
    render(
      <CqlLibraryActionCenter canEdit={true} library={versionedCqlLibrary} />
    );
    const actionCenterButton = screen.getByLabelText("Library action center");
    userEvent.click(actionCenterButton);
    expect(screen.queryByTestId("DeleteLibrary")).not.toBeInTheDocument();
  });

  it("should trigger delete-library event when 'Delete Library' action is clicked", () => {
    const dispatchEventSpy = jest.spyOn(window, "dispatchEvent");
    render(<CqlLibraryActionCenter canEdit={true} library={cqlLibrary} />);
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
    render(<CqlLibraryActionCenter canEdit={true} library={cqlLibrary} />);
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

  it("should trigger draft-library event when 'Draft Library' action is clicked", () => {
    const dispatchEventSpy = jest.spyOn(window, "dispatchEvent");
    render(<CqlLibraryActionCenter canEdit={true} library={versionedCqlLibrary} />);
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
    render(<CqlLibraryActionCenter canEdit={true} library={cqlLibrary} />);

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
      expect.objectContaining({ isTrusted: false }, { isTrusted: false })
    );
  });
});
