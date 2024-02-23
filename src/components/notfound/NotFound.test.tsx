import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import NotFound from "./NotFound";
import { MemoryRouter } from "react-router";
import { Router } from "react-router-dom";
import { useNavigate } from "react-router-dom";

jest.mock("@madie/madie-util", () => ({
  useDocumentTitle: jest.fn(),
}));
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("NotFound component", () => {
  it("should render NotFound component", async () => {
    const { getByTestId, getByText } = render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    expect(getByTestId("404-page")).toBeInTheDocument();
    expect(getByText("404 - Not Found!")).toBeInTheDocument();
    expect(getByTestId("404-page-link")).toBeInTheDocument();
  });

  it("should render home page after clicking Go Home", async () => {
    const navigate = jest.fn();
    useNavigate.mockReturnValue(navigate);
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    const link = screen.getByTestId("404-page-link");
    fireEvent.click(link);
    expect(navigate).toHaveBeenCalledWith("/");
  });
});
