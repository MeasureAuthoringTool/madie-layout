import activityTracker, {
  MADiE_LAST_LAST_ACTIVITY,
  MADiE_IDLE_TIMEOUT_OVERRIDE,
  THROTTLE_INTERVAL_MS,
  DEFAULT_IDLE_TIMEOUT_MS,
  MAX_IDLE_TIMEOUT_MS,
  TRACKED_EVENTS,
} from "./activityTracker";

describe("activityTracker", () => {
  let addEventListenerSpy: jest.SpyInstance;
  let removeEventListenerSpy: jest.SpyInstance;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Stop any existing tracking to reset internal state
    activityTracker.stopTracking();
    // Spy on document event listener methods
    addEventListenerSpy = jest.spyOn(document, "addEventListener");
    removeEventListenerSpy = jest.spyOn(document, "removeEventListener");
    // Reset Date.now mock if any
    jest.restoreAllMocks();
    addEventListenerSpy = jest.spyOn(document, "addEventListener");
    removeEventListenerSpy = jest.spyOn(document, "removeEventListener");
  });

  afterEach(() => {
    activityTracker.stopTracking();
    jest.restoreAllMocks();
  });

  describe("constants", () => {
    it("should have the correct storage key for last activity", () => {
      expect(MADiE_LAST_LAST_ACTIVITY).toBe("madie_last_activity");
    });

    it("should have the correct storage key for timeout override", () => {
      expect(MADiE_IDLE_TIMEOUT_OVERRIDE).toBe("madie_idle_timeout_override");
    });

    it("should have a 15 second throttle interval", () => {
      expect(THROTTLE_INTERVAL_MS).toBe(15_000);
    });

    it("should have a 30 minute default idle timeout", () => {
      expect(DEFAULT_IDLE_TIMEOUT_MS).toBe(30 * 60 * 1000);
    });

    it("should have a 30 minute max idle timeout", () => {
      expect(MAX_IDLE_TIMEOUT_MS).toBe(30 * 60 * 1000);
    });

    it("should track the correct DOM events", () => {
      expect(TRACKED_EVENTS).toEqual([
        "mousemove",
        "mousedown",
        "keydown",
        "scroll",
        "touchstart",
        "click",
      ]);
    });
  });

  describe("recordActivity", () => {
    it("should write the current timestamp to localStorage", () => {
      const now = 1700000000000;
      jest.spyOn(Date, "now").mockReturnValue(now);

      // Force record first to bypass throttle (sets lastRecordedTime to `now`)
      activityTracker.forceRecordActivity();

      expect(localStorage.getItem(MADiE_LAST_LAST_ACTIVITY)).toBe(String(now));
    });

    it("should throttle writes to at most once every 15 seconds", () => {
      const baseTime = 1700000000000;
      const dateNowSpy = jest.spyOn(Date, "now");

      // First call — should record
      dateNowSpy.mockReturnValue(baseTime);
      activityTracker.forceRecordActivity(); // bypass throttle to set baseline
      expect(localStorage.getItem(MADiE_LAST_LAST_ACTIVITY)).toBe(
        String(baseTime)
      );

      // Second call within 15 seconds — should NOT record
      dateNowSpy.mockReturnValue(baseTime + 10_000); // 10 seconds later
      activityTracker.recordActivity();
      expect(localStorage.getItem(MADiE_LAST_LAST_ACTIVITY)).toBe(
        String(baseTime)
      ); // unchanged

      // Third call after 15 seconds — should record
      dateNowSpy.mockReturnValue(baseTime + 16_000); // 16 seconds later
      activityTracker.recordActivity();
      expect(localStorage.getItem(MADiE_LAST_LAST_ACTIVITY)).toBe(
        String(baseTime + 16_000)
      );
    });

    it("should handle localStorage errors gracefully and log a warning", () => {
      const error = new Error("QuotaExceededError");
      jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw error;
      });
      const warnSpy = jest.spyOn(console, "warn").mockImplementation();

      // Should not throw
      expect(() => activityTracker.forceRecordActivity()).not.toThrow();
      expect(warnSpy).toHaveBeenCalledWith(
        "[ActivityTracker] Unable to write last activity to localStorage",
        error
      );
    });
  });

  describe("forceRecordActivity", () => {
    it("should bypass the throttle and always write", () => {
      const baseTime = 1700000000000;
      const dateNowSpy = jest.spyOn(Date, "now");

      // First force record
      dateNowSpy.mockReturnValue(baseTime);
      activityTracker.forceRecordActivity();
      expect(localStorage.getItem(MADiE_LAST_LAST_ACTIVITY)).toBe(
        String(baseTime)
      );

      // Immediately force record again (within throttle window)
      dateNowSpy.mockReturnValue(baseTime + 1000); // 1 second later
      activityTracker.forceRecordActivity();
      expect(localStorage.getItem(MADiE_LAST_LAST_ACTIVITY)).toBe(
        String(baseTime + 1000)
      ); // Updated!
    });
  });

  describe("getLastActivityTimestamp", () => {
    it("should return 0 when no activity has been recorded", () => {
      expect(activityTracker.getLastActivityTimestamp()).toBe(0);
    });

    it("should return the stored timestamp", () => {
      const timestamp = 1700000000000;
      localStorage.setItem(MADiE_LAST_LAST_ACTIVITY, String(timestamp));

      expect(activityTracker.getLastActivityTimestamp()).toBe(timestamp);
    });

    it("should return 0 for invalid stored values", () => {
      localStorage.setItem(MADiE_LAST_LAST_ACTIVITY, "not_a_number");
      expect(activityTracker.getLastActivityTimestamp()).toBe(0);
    });

    it("should handle localStorage errors gracefully and log a warning", () => {
      const error = new Error("SecurityError");
      jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw error;
      });
      const warnSpy = jest.spyOn(console, "warn").mockImplementation();

      expect(activityTracker.getLastActivityTimestamp()).toBe(0);
      expect(warnSpy).toHaveBeenCalledWith(
        "[ActivityTracker] Unable to read last activity from localStorage",
        error
      );
    });
  });

  describe("getIdleTimeoutMs", () => {
    it("should return the default 30 minute timeout when no override is set", () => {
      expect(activityTracker.getIdleTimeoutMs()).toBe(DEFAULT_IDLE_TIMEOUT_MS);
    });

    it("should use a localStorage override when set", () => {
      const customTimeout = 5 * 60 * 1000; // 5 minutes
      localStorage.setItem(MADiE_IDLE_TIMEOUT_OVERRIDE, String(customTimeout));

      expect(activityTracker.getIdleTimeoutMs()).toBe(customTimeout);
    });

    it("should cap the override at 30 minutes maximum", () => {
      const excessiveTimeout = 60 * 60 * 1000; // 60 minutes
      localStorage.setItem(
        MADiE_IDLE_TIMEOUT_OVERRIDE,
        String(excessiveTimeout)
      );

      expect(activityTracker.getIdleTimeoutMs()).toBe(MAX_IDLE_TIMEOUT_MS);
    });

    it("should ignore invalid override values", () => {
      localStorage.setItem(MADiE_IDLE_TIMEOUT_OVERRIDE, "invalid");
      expect(activityTracker.getIdleTimeoutMs()).toBe(DEFAULT_IDLE_TIMEOUT_MS);
    });

    it("should ignore negative override values", () => {
      localStorage.setItem(MADiE_IDLE_TIMEOUT_OVERRIDE, "-5000");
      expect(activityTracker.getIdleTimeoutMs()).toBe(DEFAULT_IDLE_TIMEOUT_MS);
    });

    it("should ignore zero override value", () => {
      localStorage.setItem(MADiE_IDLE_TIMEOUT_OVERRIDE, "0");
      expect(activityTracker.getIdleTimeoutMs()).toBe(DEFAULT_IDLE_TIMEOUT_MS);
    });

    it("should handle localStorage errors gracefully and log a warning", () => {
      const error = new Error("SecurityError");
      jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw error;
      });
      const warnSpy = jest.spyOn(console, "warn").mockImplementation();

      expect(activityTracker.getIdleTimeoutMs()).toBe(DEFAULT_IDLE_TIMEOUT_MS);
      expect(warnSpy).toHaveBeenCalledWith(
        "[ActivityTracker] Unable to read timeout override from localStorage",
        error
      );
    });
  });

  describe("isIdleTimeoutExceeded", () => {
    it("should return false when no activity has been recorded", () => {
      expect(activityTracker.isIdleTimeoutExceeded()).toBe(false);
    });

    it("should return false when last activity is within the timeout window", () => {
      const now = 1700000000000;
      jest.spyOn(Date, "now").mockReturnValue(now);

      // Activity 10 minutes ago
      localStorage.setItem(
        MADiE_LAST_LAST_ACTIVITY,
        String(now - 10 * 60 * 1000)
      );

      expect(activityTracker.isIdleTimeoutExceeded()).toBe(false);
    });

    it("should return true when last activity exceeds the timeout window", () => {
      const now = 1700000000000;
      jest.spyOn(Date, "now").mockReturnValue(now);

      // Activity 31 minutes ago
      localStorage.setItem(
        MADiE_LAST_LAST_ACTIVITY,
        String(now - 31 * 60 * 1000)
      );

      expect(activityTracker.isIdleTimeoutExceeded()).toBe(true);
    });

    it("should return true when last activity is exactly at the timeout threshold", () => {
      const now = 1700000000000;
      jest.spyOn(Date, "now").mockReturnValue(now);

      // Activity exactly 30 minutes ago
      localStorage.setItem(
        MADiE_LAST_LAST_ACTIVITY,
        String(now - DEFAULT_IDLE_TIMEOUT_MS)
      );

      expect(activityTracker.isIdleTimeoutExceeded()).toBe(true);
    });

    it("should respect the configurable timeout override", () => {
      const now = 1700000000000;
      jest.spyOn(Date, "now").mockReturnValue(now);

      // Set a 5-minute timeout override
      const fiveMinutes = 5 * 60 * 1000;
      localStorage.setItem(MADiE_IDLE_TIMEOUT_OVERRIDE, String(fiveMinutes));

      // Activity 6 minutes ago — should be exceeded with 5 min timeout
      localStorage.setItem(
        MADiE_LAST_LAST_ACTIVITY,
        String(now - 6 * 60 * 1000)
      );

      expect(activityTracker.isIdleTimeoutExceeded()).toBe(true);
    });

    it("should not exceed timeout with override when activity is recent", () => {
      const now = 1700000000000;
      jest.spyOn(Date, "now").mockReturnValue(now);

      // Set a 5-minute timeout override
      const fiveMinutes = 5 * 60 * 1000;
      localStorage.setItem(MADiE_IDLE_TIMEOUT_OVERRIDE, String(fiveMinutes));

      // Activity 3 minutes ago — should NOT be exceeded with 5 min timeout
      localStorage.setItem(
        MADiE_LAST_LAST_ACTIVITY,
        String(now - 3 * 60 * 1000)
      );

      expect(activityTracker.isIdleTimeoutExceeded()).toBe(false);
    });
  });

  describe("startTracking", () => {
    it("should attach event listeners for all tracked events", () => {
      activityTracker.startTracking();

      TRACKED_EVENTS.forEach((event) => {
        expect(addEventListenerSpy).toHaveBeenCalledWith(
          event,
          expect.any(Function),
          { passive: true }
        );
      });
    });

    it("should record initial activity when tracking starts", () => {
      const now = 1700000000000;
      jest.spyOn(Date, "now").mockReturnValue(now);

      activityTracker.startTracking();

      expect(localStorage.getItem(MADiE_LAST_LAST_ACTIVITY)).toBe(String(now));
    });

    it("should not attach listeners more than once", () => {
      activityTracker.startTracking();
      activityTracker.startTracking(); // second call

      // Each event should only be attached once
      const callsPerEvent = TRACKED_EVENTS.map(
        (event) =>
          addEventListenerSpy.mock.calls.filter((call) => call[0] === event)
            .length
      );
      callsPerEvent.forEach((count) => {
        expect(count).toBe(1);
      });
    });
  });

  describe("stopTracking", () => {
    it("should remove all event listeners", () => {
      activityTracker.startTracking();
      activityTracker.stopTracking();

      TRACKED_EVENTS.forEach((event) => {
        expect(removeEventListenerSpy).toHaveBeenCalledWith(
          event,
          expect.any(Function)
        );
      });
    });

    it("should be safe to call when not tracking", () => {
      expect(() => activityTracker.stopTracking()).not.toThrow();
    });

    it("should remove the last activity key from localStorage", () => {
      activityTracker.startTracking();
      // Verify activity was recorded
      expect(localStorage.getItem(MADiE_LAST_LAST_ACTIVITY)).not.toBeNull();

      activityTracker.stopTracking();

      expect(localStorage.getItem(MADiE_LAST_LAST_ACTIVITY)).toBeNull();
    });

    it("should remove the idle timeout override key from localStorage", () => {
      localStorage.setItem(MADiE_IDLE_TIMEOUT_OVERRIDE, "300000");
      activityTracker.startTracking();

      activityTracker.stopTracking();

      expect(localStorage.getItem(MADiE_IDLE_TIMEOUT_OVERRIDE)).toBeNull();
    });

    it("should handle localStorage errors gracefully when clearing", () => {
      activityTracker.startTracking();

      const error = new Error("SecurityError");
      jest.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
        throw error;
      });
      const warnSpy = jest.spyOn(console, "warn").mockImplementation();

      expect(() => activityTracker.stopTracking()).not.toThrow();
      expect(warnSpy).toHaveBeenCalledWith(
        "[ActivityTracker] Unable to clear localStorage on stop",
        error
      );
    });

    it("should allow restarting tracking after stop", () => {
      activityTracker.startTracking();
      activityTracker.stopTracking();
      addEventListenerSpy.mockClear();

      activityTracker.startTracking();

      TRACKED_EVENTS.forEach((event) => {
        expect(addEventListenerSpy).toHaveBeenCalledWith(
          event,
          expect.any(Function),
          { passive: true }
        );
      });
    });
  });

  describe("integration: event triggers recordActivity", () => {
    it("should record activity when a tracked DOM event fires", () => {
      const now = 1700000000000;
      jest.spyOn(Date, "now").mockReturnValue(now);

      activityTracker.startTracking();

      // The initial forceRecordActivity in startTracking sets the timestamp
      expect(localStorage.getItem(MADiE_LAST_LAST_ACTIVITY)).toBe(String(now));

      // Simulate time passing beyond throttle and trigger event
      const laterTime = now + 20_000;
      jest.spyOn(Date, "now").mockReturnValue(laterTime);
      document.dispatchEvent(new Event("mousemove"));

      expect(localStorage.getItem(MADiE_LAST_LAST_ACTIVITY)).toBe(
        String(laterTime)
      );
    });
  });
});
