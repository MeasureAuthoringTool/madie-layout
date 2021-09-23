import React from "react";
import { render } from "@testing-library/react";
import Home from "./Home";

jest.mock("@okta/okta-react", () => {
  return {
    useOktaAuth: () => ({
      oktaAuth: {
        signout: () => {},
      },
    }),
  };
});

describe("Home component", () => {
  it("should mount home component", async () => {
    const { getByText } = render(<Home />);
    expect(getByText(/You are successfully logged in/i)).toBeInTheDocument();
  });
});
