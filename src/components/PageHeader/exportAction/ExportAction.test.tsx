import * as React from "react";
import { render, screen } from "@testing-library/react";
import ExportAction from "./ExportAction";
import userEvent from "@testing-library/user-event";

const mockUser = "test user";
jest.mock("@madie/madie-util", () => ({
  useOktaTokens: () => ({
    getUserName: () => mockUser,
  }),
}));

describe("ExportAction", () => {
  it("should call onClick when Export for Publishing button is clicked", async () => {
    const mockOnClick = jest.fn();
    render(<ExportAction onClick={mockOnClick} />);

    const exportIcon = screen.getByTestId("export-action-btn");
    userEvent.click(exportIcon);

    const exportForPublishingButton = await screen.findByRole("menuitem", {
      name: "Export for Publishing",
    });
    userEvent.click(exportForPublishingButton);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith("Export for Publishing");
  });

  it("should call onClick when Export button is clicked", async () => {
    const mockOnClick = jest.fn();
    render(<ExportAction onClick={mockOnClick} />);

    const exportIcon = screen.getByTestId("export-action-btn");
    userEvent.click(exportIcon);

    const exportButton = await screen.findByRole("menuitem", {
      name: "Export",
    });
    userEvent.click(exportButton);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith("Export");
  });
});
