import React from "react";
import { render, fireEvent, screen, cleanup } from "@testing-library/react";
import MeasureActionCenter from "./MeasureActionCenter"; // Adjust the import path as necessary

describe("MeasureActionCenter", () => {
  afterEach(() => {
    cleanup(); // Clear the rendered components after each test
  });

  test("renders without crashing", () => {
    render(<MeasureActionCenter />);
    const actionCenter = screen.getByTestId("action-center");
    expect(actionCenter).toBeInTheDocument();
  });

  test("toggles open and close state on button click", () => {
    render(<MeasureActionCenter />);
    const actionCenterButton = screen.getByTestId("action-center-button");
    const icon = screen.getByTestId("action-center-actual-icon");

    expect(icon).toHaveStyle("transform: none");

    fireEvent.click(actionCenterButton);
    expect(icon).toHaveStyle("transform: rotate(90deg)");

    fireEvent.click(actionCenterButton);
    expect(icon).toHaveStyle("transform: none");
  });

  test.skip("renders delete action when action center is clicked", () => {
    //will update when delete is fully implemented
    render(<MeasureActionCenter />);

    const actionCenterButton = screen.getByTestId("action-center-button");
    fireEvent.click(actionCenterButton);

    const deleteAction = screen.getByText("Delete Measure");
    expect(deleteAction).toBeInTheDocument();
    fireEvent.click(actionCenterButton);
    expect(deleteAction).not.toBeInTheDocument();
  });
});
