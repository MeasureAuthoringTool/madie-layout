import { render } from "@testing-library/react";
import * as React from "react";
import Footer from "./Footer";

describe("Footer component", () => {
  it("should display custom madie and hhs logos in footer", async () => {
    const { getByTestId } = render(<Footer />);
    const customMadieLogo = getByTestId("custom-madie-logo");
    const customHHSLogo = getByTestId("custom-hhs-logo");
    expect(customHHSLogo).toBeTruthy();
    expect(customMadieLogo).toBeTruthy();
  });
});
