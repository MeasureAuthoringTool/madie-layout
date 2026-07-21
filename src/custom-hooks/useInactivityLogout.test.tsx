import * as React from "react";
import { render, act, cleanup } from "@testing-library/react";
import { useOktaAuth } from "@okta/okta-react";
import {
  useInactivityLogout,
  IDLE_CHECK_INTERVAL_MS,
} from "./useInactivityLogout";
import {
  activityTracker,
  MADiE_LAST_ACTIVITY,
} from "../services/activityTracker";

jest.mock("@okta/okta-react");

// A trivial component that mounts the hook under test.
const HookHarness = () => {
  useInactivityLogout();
  return <div>harness</div>;
};

const mockSignOut = jest.fn();

const setAuth = (isAuthenticated: boolean | undefined) => {
  (useOktaAuth as jest.Mock).mockImplementation(() => ({
    oktaAuth: { signOut: mockSignOut },
    authState: { isAuthenticated },
  }));
};

describe("useInactivityLogout", () => {
  let startSpy: jest.SpyInstance;
  let stopSpy: jest.SpyInstance;
  let idleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    mockSignOut.mockReset().mockResolvedValue(undefined);
    startSpy = jest
      .spyOn(activityTracker, "startTracking")
      .mockImplementation(() => undefined);
    stopSpy = jest
      .spyOn(activityTracker, "stopTracking")
      .mockImplementation(() => undefined);
    idleSpy = jest
      .spyOn(activityTracker, "isIdleTimeoutExceeded")
      .mockReturnValue(false);
    setAuth(true);
  });

  afterEach(() => {
    cleanup();
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("starts activity tracking when the user is authenticated", () => {
    render(<HookHarness />);
    expect(startSpy).toHaveBeenCalledTimes(1);
  });

  it("does not start tracking when the user is not authenticated", () => {
    setAuth(false);
    render(<HookHarness />);
    expect(startSpy).not.toHaveBeenCalled();
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it("does not start tracking when auth state is unknown (undefined)", () => {
    setAuth(undefined);
    render(<HookHarness />);
    expect(startSpy).not.toHaveBeenCalled();
  });

  it("checks for idle timeout on the periodic interval", () => {
    render(<HookHarness />);
    expect(idleSpy).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(IDLE_CHECK_INTERVAL_MS);
    });
    expect(idleSpy).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(IDLE_CHECK_INTERVAL_MS);
    });
    expect(idleSpy).toHaveBeenCalledTimes(2);
  });

  it("does not sign out while the user remains active", () => {
    render(<HookHarness />);
    act(() => {
      jest.advanceTimersByTime(IDLE_CHECK_INTERVAL_MS * 5);
    });
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it("signs the user out once the idle timeout is exceeded", () => {
    render(<HookHarness />);
    idleSpy.mockReturnValue(true);

    act(() => {
      jest.advanceTimersByTime(IDLE_CHECK_INTERVAL_MS);
    });
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("only signs out once even if later intervals still report idle", () => {
    render(<HookHarness />);
    idleSpy.mockReturnValue(true);

    act(() => {
      jest.advanceTimersByTime(IDLE_CHECK_INTERVAL_MS * 3);
    });
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("cleans up the interval and stops tracking on unmount", () => {
    const { unmount } = render(<HookHarness />);
    expect(startSpy).toHaveBeenCalledTimes(1);

    unmount();
    expect(stopSpy).toHaveBeenCalledTimes(1);

    // No further idle checks after unmount.
    idleSpy.mockClear();
    act(() => {
      jest.advanceTimersByTime(IDLE_CHECK_INTERVAL_MS * 2);
    });
    expect(idleSpy).not.toHaveBeenCalled();
  });

  it("stops tracking and stops checking when the user logs out", () => {
    const { rerender } = render(<HookHarness />);
    expect(startSpy).toHaveBeenCalledTimes(1);

    // Simulate auth state flipping to logged out.
    setAuth(false);
    rerender(<HookHarness />);
    expect(stopSpy).toHaveBeenCalledTimes(1);

    idleSpy.mockClear();
    act(() => {
      jest.advanceTimersByTime(IDLE_CHECK_INTERVAL_MS * 2);
    });
    expect(idleSpy).not.toHaveBeenCalled();
  });

  it("retries sign out on a later tick if the first attempt fails", async () => {
    render(<HookHarness />);
    idleSpy.mockReturnValue(true);
    const rejection = new Error("network down");
    mockSignOut.mockRejectedValueOnce(rejection);
    const errorSpy = jest.spyOn(console, "error").mockImplementation();

    await act(async () => {
      jest.advanceTimersByTime(IDLE_CHECK_INTERVAL_MS);
      // Allow the rejected signOut promise to settle and reset the guard.
      await Promise.resolve();
    });
    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(
      "[useInactivityLogout] Failed to sign out user",
      rejection
    );

    // A subsequent tick should attempt sign out again.
    act(() => {
      jest.advanceTimersByTime(IDLE_CHECK_INTERVAL_MS);
    });
    expect(mockSignOut).toHaveBeenCalledTimes(2);
  });

  describe("cross-tab activity with StorageEvent", () => {
    const dispatchStorage = (key: string | null) => {
      act(() => {
        window.dispatchEvent(
          new StorageEvent("storage", {
            key,
            newValue: String(Date.now()),
          })
        );
      });
    };

    it("re-evaluates idle immediately on a storage event for the activity key, without waiting for the poll", () => {
      render(<HookHarness />);
      idleSpy.mockReturnValue(true);

      // No timer advance — the storage event alone should trigger the check.
      dispatchStorage(MADiE_LAST_ACTIVITY);

      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });

    it("does not log out when another tab records fresh activity (still active)", () => {
      render(<HookHarness />);
      // Another tab just wrote a fresh timestamp → not idle.
      idleSpy.mockReturnValue(false);

      dispatchStorage(MADiE_LAST_ACTIVITY);

      expect(mockSignOut).not.toHaveBeenCalled();
    });

    it("ignores storage events for unrelated keys", () => {
      render(<HookHarness />);
      idleSpy.mockReturnValue(true);

      dispatchStorage("some_other_app_key");
      // key === null happens on localStorage.clear() — must also be ignored.
      dispatchStorage(null);

      expect(mockSignOut).not.toHaveBeenCalled();
    });

    it("removes the storage listener on unmount", () => {
      const { unmount } = render(<HookHarness />);
      idleSpy.mockReturnValue(true);
      unmount();

      dispatchStorage(MADiE_LAST_ACTIVITY);

      expect(mockSignOut).not.toHaveBeenCalled();
    });

    it("stops responding to storage events once the user logs out", () => {
      const { rerender } = render(<HookHarness />);
      idleSpy.mockReturnValue(true);

      setAuth(false);
      rerender(<HookHarness />);

      dispatchStorage(MADiE_LAST_ACTIVITY);

      expect(mockSignOut).not.toHaveBeenCalled();
    });
  });
});
