import { render, screen } from "@testing-library/react";
import * as React from "react";
import Footer from "./Footer";
import { ServiceConfig } from "@madie/madie-util";

const mockConfig: ServiceConfig = {
  measureService: {
    baseUrl: "example-service-url",
  },
  cqlLibraryService: {
    baseUrl: "test-cql-library-service-url",
  },
  madieVersion: "1.2.3",
};
jest.mock("@madie/madie-util", () => ({
  getServiceConfig: () => Promise.resolve(mockConfig),
  useServiceConfig: () => mockConfig,
}));

describe("Footer component", () => {
  it("should display custom madie and hhs logos in footer", async () => {
    const { getByTestId } = render(<Footer config={mockConfig} />);
    const customMadieLogo = getByTestId("custom-madie-logo");
    const customHHSLogo = getByTestId("custom-hhs-logo");
    expect(customHHSLogo).toBeTruthy();
    expect(customMadieLogo).toBeTruthy();
    expect(await screen.findByText("Version 1.2.3")).toBeInTheDocument();
  });
});
