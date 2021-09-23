import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import Editor from "./Editor";

describe("Editor component", () => {
  it("should mount editor component", async () => {
    render(<Editor />);
    fireEvent.click(screen.getByTestId("madie-editor"));
    const editorValdivEl: HTMLElement = await screen.getByTestId(
      "madie-editor-value"
    );
    expect(editorValdivEl.innerHTML).toEqual(
      "library testCql version '1.0.000'"
    );
    expect(localStorage.getItem("editorVal")).toEqual(
      "library testCql version '1.0.000'"
    );
  });
});
