import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Measure, MeasureSet, Model } from "@madie/madie-models";
import ShareAction from "./ShareAction";

const mockUser = "test user";
jest.mock("@madie/madie-util", () => ({
  useOktaTokens: () => ({
    getUserName: () => mockUser,
  }),
}));

const mockMeasureSet = {
  cmsId: "124",
  measureSetId: "1-2-3-4",
  owner: mockUser,
} as unknown as MeasureSet;

const qdmMeasure = {
  model: Model.QDM_5_6,
  measureSet: mockMeasureSet,
  measureSetId: "1-2-3-4",
} as Measure;

const qiCoreMeasure = {
  model: Model.QICORE,
  measureSet: { ...mockMeasureSet, cmsId: null },
  measureSetId: "1-2-3-4",
  measureMetaData: { draft: true },
} as unknown as Measure;

describe("ShareAction", () => {
  it("Should display menu items when the share action btn is clicked and call associated onClick method when menu item is clicked", () => {
    const onClick = jest.fn();
    render(<ShareAction onClick={onClick} />);

    const shareButton = screen.getByTestId("share-action-btn");

    expect(shareButton).not.toBeDisabled();

    fireEvent.click(shareButton);

    const shareWithMenuItem = screen.getByTestId("Share With-option");
    const unsharehMenuItem = screen.getByTestId("Unshare-option");

    expect(shareWithMenuItem).toBeInTheDocument();
    expect(unsharehMenuItem).toBeInTheDocument();

    fireEvent.click(screen.getByRole("menuitem", { name: "Share With" }));
    expect(onClick).toHaveBeenCalledWith("Share With");

    fireEvent.click(shareButton);
    fireEvent.click(screen.getByRole("menuitem", { name: "Unshare" }));
    expect(onClick).toHaveBeenCalledWith("Unshare");
  });
});
