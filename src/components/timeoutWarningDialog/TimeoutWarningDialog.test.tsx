import * as React from "react";
import { render, screen, act, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TimeoutWarningDialog, {
  WARNING_THRESHOLD_MS,
  WARNING_POLL_INTERVAL_MS,
} from "./TimeoutWarningDialog";
import {
  activityTracker,
  MADiE_LAST_ACTIVITY,
} from "../../services/activityTracker";

const WARNING_TITLE = "Session Expiration Warning";

describe("TimeoutWarningDialog", () => {
  let remainingSpy: jest.SpyInstance;
  let forceSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    remainingSpy = jest
      .spyOn(activityTracker, "getRemainingIdleMs")
      .mockReturnValue(WARNING_THRESHOLD_MS + 60_000);
    forceSpy = jest
      .spyOn(activityTracker, "forceRecordActivity")
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    cleanup();
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  const tick = () => {
    act(() => {
      jest.advanceTimersByTime(WARNING_POLL_INTERVAL_MS);
    });
  };

  // Simulate the countdown resetting (as forceRecordActivity would) and flush
  // the MUI Dialog exit transition so the node is removed from the DOM.
  const settleDismissal = () => {
    remainingSpy.mockReturnValue(WARNING_THRESHOLD_MS + 120_000);
    act(() => {
      jest.advanceTimersByTime(1000);
    });
  };

  it("does not show the warning while more than 5 minutes remain", () => {
    render(<TimeoutWarningDialog />);
    tick();
    expect(screen.queryByText(WARNING_TITLE)).not.toBeInTheDocument();
  });

  it("shows the warning once 5 minutes or less remain", () => {
    render(<TimeoutWarningDialog />);
    remainingSpy.mockReturnValue(WARNING_THRESHOLD_MS);
    tick();
    expect(screen.getByText(WARNING_TITLE)).toBeInTheDocument();
    expect(
      screen.getByText(/Interact with this screen to continue your session\./i)
    ).toBeInTheDocument();
  });

  it("force-updates activity and dismisses the warning when clicked", () => {
    render(<TimeoutWarningDialog />);
    remainingSpy.mockReturnValue(WARNING_THRESHOLD_MS - 1000);
    tick();
    const warning = screen.getByText(WARNING_TITLE);
    expect(warning).toBeInTheDocument();

    userEvent.click(warning);
    expect(forceSpy).toHaveBeenCalled();
    settleDismissal();
    expect(screen.queryByText(WARNING_TITLE)).not.toBeInTheDocument();
  });

  it("dismisses the warning on key press and force-records activity", () => {
    render(<TimeoutWarningDialog />);
    remainingSpy.mockReturnValue(WARNING_THRESHOLD_MS - 1000);
    tick();
    expect(screen.getByText(WARNING_TITLE)).toBeInTheDocument();

    userEvent.keyboard("a");
    expect(forceSpy).toHaveBeenCalled();
    settleDismissal();
    expect(screen.queryByText(WARNING_TITLE)).not.toBeInTheDocument();
  });

  it("re-evaluates on cross-tab activity storage events", () => {
    render(<TimeoutWarningDialog />);
    remainingSpy.mockReturnValue(WARNING_THRESHOLD_MS - 1000);
    tick();
    expect(screen.getByText(WARNING_TITLE)).toBeInTheDocument();

    // Another tab recorded fresh activity → full window remaining again.
    remainingSpy.mockReturnValue(WARNING_THRESHOLD_MS + 120_000);
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: MADiE_LAST_ACTIVITY,
          newValue: String(Date.now()),
        })
      );
    });
    // Flush the MUI Dialog exit transition.
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.queryByText(WARNING_TITLE)).not.toBeInTheDocument();
  });

  it("stops polling after unmount", () => {
    const { unmount } = render(<TimeoutWarningDialog />);
    unmount();
    remainingSpy.mockClear();
    act(() => {
      jest.advanceTimersByTime(WARNING_POLL_INTERVAL_MS * 3);
    });
    expect(remainingSpy).not.toHaveBeenCalled();
  });
});
