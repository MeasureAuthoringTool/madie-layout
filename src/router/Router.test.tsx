import * as React from "react";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { Security } from "@okta/okta-react";

import Router from "./Router";
import { oktaAuthTestProps } from "./TestAuthProvider";

jest.mock("../components/home/Home", () => () => {
  return <div data-testid="home-component-mocked">Home Component</div>;
});

jest.mock("../components/login/Login", () => () => {
  return <div data-testid="login-component-mocked">Login Component</div>;
});

jest.mock("../components/editor/Editor", () => () => {
  return <div data-testid="editor-component-mocked">Editor Component</div>;
});

jest.mock("../components/measure/Measure", () => () => {
  return <div data-testid="measure-component-mocked">Measure Component</div>;
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

  it("should render Home component if authentication is true", async () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={["/"]}>
        <Security {...oktaAuthTestProps(true)}>
          <Router {...routerProps} />
        </Security>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(getByTestId("home-component-mocked")).toBeInTheDocument();
    });
  });

  it("should render Measure component if authentication is true", async () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={["/measure"]}>
        <Security {...oktaAuthTestProps(true)}>
          <Router {...routerProps} />
        </Security>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(getByTestId("measure-component-mocked")).toBeInTheDocument();
    });
  });

  it("should render Editor component if authentication is true", async () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={["/editor"]}>
        <Security {...oktaAuthTestProps(true)}>
          <Router {...routerProps} />
        </Security>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(getByTestId("editor-component-mocked")).toBeInTheDocument();
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
