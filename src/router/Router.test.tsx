import * as React from "react";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { Security } from "@okta/okta-react";

import Router from "./Router";
import { oktaAuthTestProps } from "./TestAuthProvider";

jest.mock("@madie/madie-measure", () => ({
  MadieMeasure: () => {
    return <div data-testid="measure-component-mocked">measure Component</div>;
  },
}));

jest.mock("@madie/madie-cql-library", () => ({
  MadieCqlLibrary: () => {
    return (
      <div data-testid="cql-library-component-mocked">
        Cql Library Component
      </div>
    );
  },
}));

jest.mock("../components/login/Login", () => () => {
  return <div data-testid="login-component-mocked">Login Component</div>;
});

jest.mock("../components/MainNavBar/MainNavBar", () => () => {
  return <div data-testid="main-nav-bar-mocked">Main Nav Bar</div>;
});

describe("Router component", () => {
  const routerProps = {
    props: {
      oktaSignInConfig: {
        baseUrl: "https://${yourOktaDomain}",
        clientId: "${clientId}",
        redirectUri: "/login/callback",
      },
    },
  };

  it("should redirect to measure component if authentication is true", async () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={["/"]}>
        <Security {...oktaAuthTestProps(true)}>
          <Router {...routerProps} />
        </Security>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(getByTestId("measure-component-mocked")).toBeInTheDocument();
    });
  });

  it("should render measure component if authenticated user navigates to /measures", async () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={["/measures"]}>
        <Security {...oktaAuthTestProps(true)}>
          <Router {...routerProps} />
        </Security>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(getByTestId("measure-component-mocked")).toBeInTheDocument();
    });
  });

  it("should render Login component", async () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={["/login"]}>
        <Router {...routerProps} />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(getByTestId("login-component-mocked")).toBeInTheDocument();
    });
  });
});
