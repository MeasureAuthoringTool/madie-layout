/** @format */

import * as React from "react";
import { fireEvent, screen, render } from "@testing-library/react";
import Root from "./root.component";
import { DropDown } from "./styles/styles";

jest.mock("./okta/OktaSecurity", () => () => {
  return <div></div>;
});

describe("Root component", () => {
  it("should be in the document", () => {
    const { getByText } = render(<Root name="Testapp" />);
    expect(getByText(/Release Notes/i)).toBeInTheDocument();
  });

  it("should mount dropdown component ", async () => {
    const { container } = render(<DropDown />);
    const styles = getComputedStyle(container);
    expect(getComputedStyle(container).display).toBe("block");
  });
});
