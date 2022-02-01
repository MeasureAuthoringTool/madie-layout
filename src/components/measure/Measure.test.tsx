import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import Measure from "./Measure";

describe("Measure component", () => {
  it("should mount measure component", async () => {
    render(<Measure />);
    fireEvent.click(screen.getByTestId("madie-measure"));
  });
});
