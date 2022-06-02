import * as React from "react";
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import TimeoutHandler from "./TimeoutHandler";
import userEvent from "@testing-library/user-event";
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
    (useOktaAuth as jest.Mock).mockImplementation(() => ({
      oktaAuth: { signOut: () => jest.fn() },
      authState: { isAuthenticated: false },
    }));
    renderTimeoutHandler();
  });

  test("Timeout Handler does not render initially", async () => {
    const alertTitle = screen.queryByText("Session Expiration Warning");
    expect(alertTitle).not.toBeInTheDocument();
    expect(useOktaAuth().oktaAuth.signOut()).not.toHaveBeenCalled();
  });

  test("Timeout handler renders, then disappears on keypress escape", async () => {
    const warning = await screen.findByText("Session Expiration Warning");
    expect(warning).toBeInTheDocument();
    userEvent.keyboard("b");
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Session Expiration Warning")
    );
    expect(useOktaAuth().oktaAuth.signOut()).not.toHaveBeenCalled();
  });

  test("Timeout handler renders, then disappears on alert click", async () => {
    const warning = await screen.findByText("Session Expiration Warning");
    expect(warning).toBeInTheDocument();
    userEvent.click(warning);
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Session Expiration Warning")
    );
    expect(useOktaAuth().oktaAuth.signOut()).not.toHaveBeenCalled();
  });

  test.skip("Timeout handler renders, then disappears after outer click", async () => {
    const warning = await screen.findByText("Session Expiration Warning");
    expect(warning).toBeInTheDocument();
    userEvent.click(
      await screen.findByRole("presentation", { name: "sentinelStart" })
    );
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Session Expiration Warning")
    );
    expect(useOktaAuth().oktaAuth.signOut()).not.toHaveBeenCalled();
  });

  test("Timeout handler renders, then disappears on mouse move", async () => {
    const warning = await screen.findByText("Session Expiration Warning");
    expect(warning).toBeInTheDocument();
    userEvent.hover(warning);
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Session Expiration Warning")
    );
    expect(useOktaAuth().oktaAuth.signOut()).not.toHaveBeenCalled();
  });

  test.skip("Timeout handler renders, then signs out user after warning time expires", async () => {
    const warning = await screen.findByText("Session Expiration Warning");
    expect(warning).toBeInTheDocument();
    await waitFor(() => {
      expect(useOktaAuth().oktaAuth.signOut()).toHaveBeenCalled();
    });
  });
});
