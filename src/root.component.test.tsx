import * as React from "react";
import { render } from "@testing-library/react";
import Root from "./root.component";

describe("Root component", () => {
  it("should be in the document", () => {
    const { getByText } = render(<Root name="Testapp" />);
    expect(getByText(/Testapp is mounted!/i)).toBeInTheDocument();
  });

  it("should mount editor component", () => {
    const { getByText } = render(<Root name="Testapp" />);
    expect(getByText(/Editor is Mounted/i)).toBeInTheDocument();
  });
});
