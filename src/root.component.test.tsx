/** @format */

import * as React from "react";
import { fireEvent, screen, render } from "@testing-library/react";
import Root from "./root.component";
import { DropDown } from "./styles/styles";

describe("Root component", () => {
  it("should be in the document", () => {
    const { getByText } = render(<Root name="Testapp" />);
    expect(getByText(/Release Notes/i)).toBeInTheDocument();
  });

  it("should mount editor component", async () => {
    render(<Root name="Testapp" />);
    fireEvent.click(screen.getByTestId("madie-editor"));
    const editorValdivEl = await screen.getByTestId("madie-editor-value");
    expect(editorValdivEl.innerHTML).toEqual("Editor is Mounted");
    expect(localStorage.getItem("editorVal")).toEqual("Editor is Mounted");
  });

  it("should mount dropdown component ", async () => {
    const { container } = render(<DropDown />);
    const styles = getComputedStyle(container);
    expect(getComputedStyle(container).display).toBe("block");
  });
});
