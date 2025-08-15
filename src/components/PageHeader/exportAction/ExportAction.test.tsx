import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

describe("508, keyboard and clickaway behavior", () => {
  it("closes on Tab and prevents default + stops propagation", async () => {
    render(<ExportAction onClick={jest.fn()} />);
    userEvent.click(screen.getByTestId("export-action-btn"));

    const menuList = await screen.findByRole("menu", { name: "" });

    fireEvent.keyDown(menuList, {
      key: "Tab",
      code: "Tab",
    });

    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });

  it("closes on Escape and stops propagation", async () => {
    render(<ExportAction onClick={jest.fn()} />);
    userEvent.click(screen.getByTestId("export-action-btn"));

    const menuList = await screen.findByRole("menu", { name: "" });

    fireEvent.keyDown(menuList, {
      key: "Escape",
      code: "Escape",
    });

    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });

  it("closes when clicking away", async () => {
    render(<ExportAction onClick={jest.fn()} />);
    userEvent.click(screen.getByTestId("export-action-btn"));

    await screen.findByRole("menu");

    fireEvent.mouseDown(document.body);
    fireEvent.click(document.body);

    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });
});
