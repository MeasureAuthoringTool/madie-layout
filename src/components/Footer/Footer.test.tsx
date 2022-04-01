import { render } from "@testing-library/react";
import * as React from "react";
import Footer from "./Footer";

describe("Footer component", () => {
  it("should display custom logos in footer", async () => {
    const { getByTestId } = render(<Footer />);
    const customHHSLogo = getByTestId("custom-madie-logo");
    expect(customHHSLogo).toBeTruthy();
  });
});
