import * as React from "react";
import { render, screen } from "@testing-library/react";
import TimeoutHandler from "./TimeoutHandler";

describe("Measure Groups Page", () => {
  const renderTimeoutHandler = () => {
    return render(
      <div id="main">
        <TimeoutHandler timeLeft={10000} />
      </div>
    );
  };
  beforeEach(() => {
    renderTimeoutHandler();
  });

  test("Timeout Handler does not render initially", async () => {
    const alertTitle = screen.queryByText("Session Expiration Warning");
    expect(alertTitle).toBeNull();
  });

  test("Timeout handler renders after 10 seconds, disappears on keypress escape", async () => {
    setTimeout(() => {
      expect(screen.getByTestId("warn-timeout-title")).toBeTruthy();
      const event = new KeyboardEvent("keydown", { keyCode: 27 });
      document.dispatchEvent(event);
      const alertTitle = screen.queryByText("Session Expiration Warning");
      expect(alertTitle).toBeNull();
    }, 10000);
  });

  test("Timeout handler renders after 10 seconds, disappears on alert click", async () => {
    setTimeout(() => {
      expect(screen.getByTestId("warn-timeout-title")).toBeTruthy();
      const alertTitle = screen.queryByText("Session Expiration Warning");
      alertTitle.click();
      expect(alertTitle).toBeNull();
    }, 10000);
  });

  test("Timeout handler renders after 10 seconds, disappears on outer click", async () => {
    setTimeout(() => {
      expect(screen.getByTestId("warn-timeout-title")).toBeTruthy();
      const outerDiv = screen.getAllByTestId("sentinelStart");
      outerDiv.click();
      expect(alertTitle).toBeNull();
    }, 10000);
  });

  test("Timeout handler renders after 10 seconds, disappears on mouse move", async () => {
    setTimeout(() => {
      expect(screen.getByTestId("warn-timeout-title")).toBeTruthy();
      const alertTitle = screen.queryByText("Session Expiration Warning");
      const mouseMove = new Event("mousemove");
      document.dispatchEvent(mouseMove);
      expect(alertTitle).toBeNull();
    }, 10000);
  });
});
