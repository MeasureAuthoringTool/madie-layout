import * as React from "react";
import { render, screen } from "@testing-library/react";
import ExportAction, { EXPORT_MEASURE, NOTHING_SELECTED } from "./ExportAction";
import { Measure, MeasureSet, Model } from "@madie/madie-models";
import userEvent from "@testing-library/user-event";

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
} as Measure;

describe("ExportAction", () => {
  it("Should disable action btn if no measure selected", () => {
    render(<ExportAction measures={[]} onClick={() => {}} />);
    expect(screen.getByTestId("export-action-btn")).toBeDisabled();
    expect(screen.getByTestId("export-action-tooltip")).toHaveAttribute(
      "aria-label",
      NOTHING_SELECTED
    );
  });

  it("Should enable action btn if user select one measure ", () => {
    render(<ExportAction measures={[qiCoreMeasure]} onClick={() => {}} />);
    expect(screen.getByTestId("export-action-btn")).not.toBeDisabled();
    expect(screen.getByTestId("export-action-tooltip")).toHaveAttribute(
      "aria-label",
      EXPORT_MEASURE
    );
  });

  it("Should disable btn if user selects two measures", () => {
    const measure2 = { ...qiCoreMeasure, model: Model.QDM_5_6 };
    render(
      <ExportAction measures={[qdmMeasure, measure2]} onClick={() => {}} />
    );
    expect(screen.getByTestId("export-action-btn")).toBeDisabled();
    expect(screen.getByTestId("export-action-tooltip")).toHaveAttribute(
      "aria-label",
      NOTHING_SELECTED
    );
  });

  it("should call onClick when btn is clicked", async () => {
    const handleClick = jest.fn();
    render(<ExportAction measures={[qiCoreMeasure]} onClick={handleClick} />);

    const exportIcon = screen.getByTestId("export-action-btn");
    userEvent.click(exportIcon);

    const exportForPublishingButton = await screen.findByRole("button", {
      name: "Export for Publishing",
    });
    userEvent.click(exportForPublishingButton);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
