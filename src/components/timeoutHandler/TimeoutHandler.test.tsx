import * as React from "react";
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  cleanup,
} from "@testing-library/react";
import TimeoutHandler from "./TimeoutHandler";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "@jest/globals";
import { useOktaAuth } from "@okta/okta-react";

jest.mock("@okta/okta-react");

describe("Timeout Handler", () => {
  const renderTimeoutHandler = () => {
    return render(
      <div id="main">
        <TimeoutHandler timeLeft={1000} warningTime={500} />
      </div>
    );
  };
  beforeEach(() => {
    const MockSignOut = jest.fn().mockImplementation(() => {
      return Promise.resolve();
    });
    (useOktaAuth as jest.Mock).mockImplementation(() => ({
      oktaAuth: { signOut: MockSignOut },
      authState: { isAuthenticated: false },
    }));
    renderTimeoutHandler();
  });
  afterEach(cleanup);

  test("Timeout Handler can be called without supplying props", async () => {
    const DefaultProps = render(
      <div id="main">
        <TimeoutHandler />
      </div>
    );
    const alertTitle = DefaultProps.queryByText("Session Expiration Warning");
    expect(alertTitle).not.toBeInTheDocument();
    expect(useOktaAuth().oktaAuth.signOut).not.toHaveBeenCalled();
  });

  test("Timeout Handler will not render initially", async () => {
    const alertTitle = screen.queryByText("Session Expiration Warning");
    expect(alertTitle).not.toBeInTheDocument();
    expect(useOktaAuth().oktaAuth.signOut).not.toHaveBeenCalled();
  });

  test("Timeout handler renders, then disappears on keypress escape", async () => {
    const warning = await screen.findByText("Session Expiration Warning");
    expect(warning).toBeInTheDocument();
    userEvent.keyboard("b");
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Session Expiration Warning")
    );
    expect(useOktaAuth().oktaAuth.signOut).not.toHaveBeenCalled();
  });

  test("Timeout handler renders, then disappears on alert click", async () => {
    const warning = await screen.findByText("Session Expiration Warning");
    expect(warning).toBeInTheDocument();
    userEvent.click(warning);
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Session Expiration Warning")
    );
    expect(useOktaAuth().oktaAuth.signOut).not.toHaveBeenCalled();
  });

  test("Timeout handler renders, then disappears after outer click", async () => {
    const warning = await screen.findByText("Session Expiration Warning");
    expect(warning).toBeInTheDocument();
    // this is how mui/core testing does it
    userEvent.click(await screen.getByRole("dialog").parentElement);
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Session Expiration Warning")
    );
    expect(useOktaAuth().oktaAuth.signOut).not.toHaveBeenCalled();
  });

  test("Timeout handler renders, then disappears on mouse move", async () => {
    const warning = await screen.findByText("Session Expiration Warning");
    expect(warning).toBeInTheDocument();
    userEvent.hover(warning);
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Session Expiration Warning")
    );
    expect(useOktaAuth().oktaAuth.signOut).not.toHaveBeenCalled();
  });

  test("Timeout handler renders, then signs out user after warning time expires", async () => {
    const warning = await screen.findByText("Session Expiration Warning");
    expect(warning).toBeInTheDocument();
    await waitFor(() => {
      expect(useOktaAuth().oktaAuth.signOut).toHaveBeenCalled();
    });
  });
});
