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
  it("should call onClick when Publishable Export button is clicked", async () => {
    const mockOnClick = jest.fn();
    render(<ExportAction onClick={mockOnClick} />);

    const exportIcon = screen.getByTestId("export-action-btn");
    userEvent.click(exportIcon);

    const exportForPublishingButton = await screen.findByRole("menuitem", {
      name: "Publishable Export",
    });
    userEvent.click(exportForPublishingButton);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith("Publishable Export");
  });

  it("should call onClick when Executable Export button is clicked", async () => {
    const mockOnClick = jest.fn();
    render(<ExportAction onClick={mockOnClick} />);

    const exportIcon = screen.getByTestId("export-action-btn");
    userEvent.click(exportIcon);

    const exportButton = await screen.findByRole("menuitem", {
      name: "Executable Export",
    });
    userEvent.click(exportButton);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith("Executable Export");
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
      key: "Escape", // #nosec
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
