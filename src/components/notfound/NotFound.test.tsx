import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import NotFound from "./NotFound";
import { MemoryRouter } from "react-router";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";

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
    const history = createMemoryHistory();
    const pushSpy = jest.spyOn(history, "push");
    render(
      <Router history={history}>
        <NotFound />
      </Router>
    );

    const link = screen.getByTestId("404-page-link");
    fireEvent.click(link);
    expect(pushSpy).toHaveBeenCalled();
  });
});
