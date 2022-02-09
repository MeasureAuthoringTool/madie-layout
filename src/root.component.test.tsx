import * as React from "react";
import { render } from "@testing-library/react";
import Root from "./root.component";
import { DropDown } from "./styles/styles";

jest.mock("./okta/OktaSecurity", () => () => {
  return <div>Secure</div>;
});

describe("Root component", () => {
  it("should be in the document", () => {
    const { getByText } = render(<Root />);
    expect(getByText(/Secure/i)).toBeInTheDocument();
  });

  it("should mount dropdown component ", async () => {
    const { container } = render(<DropDown />);
    expect(getComputedStyle(container).display).toBe("block");
  });
});
