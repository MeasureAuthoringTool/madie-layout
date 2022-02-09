import * as React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import Home from "./Home";
import { BrowserRouter } from "react-router-dom";
import { useOktaAuth } from "@okta/okta-react";

jest.mock("@okta/okta-react", () => ({
  useOktaAuth: jest.fn(),
}));

const mockUseOktaAuth = useOktaAuth as jest.Mock;
const oktaAuth = { signOut: jest.fn() };
mockUseOktaAuth.mockImplementation(() => ({
  oktaAuth,
  authState: { isAuthenticated: true },
}));

describe("Home component", () => {
  it("should mount home component", async () => {
    const { getByTestId, getByText } = render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(getByTestId("madie-measure")).toBeInTheDocument();
      expect(getByText(/Release Notes/i)).toBeInTheDocument();
      expect(getByText(/Measures/i)).toBeInTheDocument();
      expect(getByText(/Logout/i)).toBeInTheDocument();
    });
  });

  it("should logout the user on clicking logout btn", async () => {
    const { getByText } = render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    const logoutBtn = await getByText(/Logout/i);
    fireEvent.click(logoutBtn);
    expect(oktaAuth.signOut).toHaveBeenCalled();
  });
});
