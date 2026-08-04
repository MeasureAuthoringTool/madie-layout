/**
 * Activity Tracker Module
 *
 * A framework-agnostic module that records user interactions and stores the
 * last activity timestamp in localStorage. Used to determine when to show
 * timeout warnings and trigger automatic logout.
 *
 * Tracked DOM events: mousemove, mousedown, keydown, scroll, touchstart, click
 * Throttle interval: 15 seconds (writes to localStorage)
 * Default idle timeout: 30 minutes (configurable via localStorage override, capped at 30 min)
 */

// --- Constants ---

const MADiE_LAST_ACTIVITY = "madie_last_activity";
const MADiE_IDLE_TIMEOUT_OVERRIDE = "madie_idle_timeout_override";
const THROTTLE_INTERVAL_MS = 15_000; // 15 seconds
const DEFAULT_IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const MAX_IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes (hard cap)

const TRACKED_EVENTS: string[] = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "click",
];

// --- Internal State ---

let lastRecordedTime = 0;
let listenersAttached = false;

// --- Core Functions ---

/**
 * Records the current timestamp to localStorage as the last user activity.
 * Throttled: will only write at most once every 15 seconds.
 */
function recordActivity(): void {
  const now = Date.now();
  if (now - lastRecordedTime < THROTTLE_INTERVAL_MS) {
    return;
  }
  lastRecordedTime = now;
  try {
    localStorage.setItem(MADiE_LAST_ACTIVITY, String(now));
  } catch (e) {
    console.warn(
      "[ActivityTracker] Unable to write last activity to localStorage",
      e
    );
  }
}

/**
 * Forces a Write of the current timestamp to localStorage, bypassing the throttle.
 * Use when the user explicitly dismisses a timeout warning to reset idle tracking.
 */
function forceRecordActivity(): void {
  const now = Date.now();
  lastRecordedTime = now;
  try {
    localStorage.setItem(MADiE_LAST_ACTIVITY, String(now));
  } catch (e) {
    console.warn(
      "[ActivityTracker] Unable to write last activity to localStorage",
      e
    );
  }
}

/**
 * Reads the last recorded activity timestamp from localStorage.
 * @returns The timestamp (ms since epoch) of last activity, or 0 if not set.
 */
function getLastActivityTimestamp(): number {
  try {
    const stored = localStorage.getItem(MADiE_LAST_ACTIVITY);
    if (stored) {
      const parsed = Number(stored);
      return Number.isFinite(parsed) ? parsed : 0;
    }
  } catch (e) {
    console.warn(
      "[ActivityTracker] Unable to read last activity from localStorage",
      e
    );
  }
  return 0;
}

/**
 * Returns the configured idle timeout in milliseconds.
 * Checks localStorage for a testing override (capped at 30 minutes max).
 * Falls back to the default of 30 minutes.
 */
function getIdleTimeoutMs(): number {
  try {
    const override = localStorage.getItem(MADiE_IDLE_TIMEOUT_OVERRIDE);
    if (override) {
      const parsed = Number(override);
      if (Number.isFinite(parsed) && parsed > 0) {
        return Math.min(parsed, MAX_IDLE_TIMEOUT_MS);
      }
    }
  } catch (e) {
    console.warn(
      "[ActivityTracker] Unable to read timeout override from localStorage",
      e
    );
  }
  return DEFAULT_IDLE_TIMEOUT_MS;
}

/**
 * Checks whether the user has been idle beyond the configured timeout threshold.
 * @returns `true` if the idle timeout has been exceeded, `false` otherwise.
 */
function isIdleTimeoutExceeded(): boolean {
  const lastActivity = getLastActivityTimestamp();
  if (lastActivity === 0) {
    // No recorded activity — treat as not exceeded (module may not be initialized)
    return false;
  }
  const elapsed = Date.now() - lastActivity;
  return elapsed >= getIdleTimeoutMs();
}

/**
 * Returns how many milliseconds remain before the idle timeout is exceeded.
 * Used to decide when to show the pre-logout warning (e.g. at 5 minutes left).
 * @returns The remaining idle time in ms, clamped to 0 once exceeded. When no
 *   activity has been recorded yet (module not initialized), returns the full
 *   idle timeout so callers do not surface a premature warning.
 */
function getRemainingIdleMs(): number {
  const lastActivity = getLastActivityTimestamp();
  if (lastActivity === 0) {
    return getIdleTimeoutMs();
  }
  const remaining = getIdleTimeoutMs() - (Date.now() - lastActivity);
  return remaining > 0 ? remaining : 0;
}

// --- Event Listener Management ---

/**
 * Attaches DOM event listeners for user activity tracking.
 * Safe to call multiple times — listeners are only attached once.
 */
function startTracking(): void {
  if (listenersAttached) {
    return;
  }
  // Record initial activity when tracking starts
  forceRecordActivity();

  TRACKED_EVENTS.forEach((event) => {
    document.addEventListener(event, recordActivity, { passive: true });
  });
  listenersAttached = true;
}

/**
 * Removes all DOM event listeners for user activity tracking.
 *
 * NOTE: this deliberately does NOT remove `MADiE_LAST_ACTIVITY` (or the
 * timeout override) from localStorage. The activity timestamp is shared by
 * every open MADiE tab — one tab tearing down its tracker (logout, unmount)
 * must not wipe the idle state other tabs are still relying on, and the
 * timestamp must survive closing all tabs. On the next login,
 * `startTracking()` force-records a fresh timestamp anyway.
 */
function stopTracking(): void {
  if (!listenersAttached) {
    return;
  }
  TRACKED_EVENTS.forEach((event) => {
    document.removeEventListener(event, recordActivity);
  });
  listenersAttached = false;
  lastRecordedTime = 0;
}

/*
 * @example
 * import { activityTracker } from "./services/activityTracker";
 * activityTracker.startTracking();            // Attach DOM event listeners
 * activityTracker.stopTracking();             // Remove DOM event listeners
 * activityTracker.recordActivity();           // Throttled activity record
 * activityTracker.forceRecordActivity();      // Bypass throttle
 * activityTracker.getLastActivityTimestamp(); // Read last activity (ms)
 * activityTracker.getIdleTimeoutMs();         // Get configured timeout
 * activityTracker.isIdleTimeoutExceeded();    // Check if idle too long
 * activityTracker.getRemainingIdleMs();       // Ms left before timeout
 */
// --- Exported API ---
export const activityTracker = {
  /** Start listening for user activity DOM events */
  startTracking,
  /** Stop listening for user activity DOM events */
  stopTracking,
  /** Record activity (throttled — at most once per 15 seconds) */
  recordActivity,
  /** Record activity immediately, bypassing the throttle */
  forceRecordActivity,
  /** Get the last recorded activity timestamp (ms since epoch) */
  getLastActivityTimestamp,
  /** Get the configured idle timeout in milliseconds */
  getIdleTimeoutMs,
  /** Check if the idle timeout has been exceeded */
  isIdleTimeoutExceeded,
  /** Get the ms remaining before the idle timeout is exceeded */
  getRemainingIdleMs,
};

export default activityTracker;

// Export constants for testing
export {
  MADiE_LAST_ACTIVITY,
  MADiE_IDLE_TIMEOUT_OVERRIDE,
  THROTTLE_INTERVAL_MS,
  DEFAULT_IDLE_TIMEOUT_MS,
  MAX_IDLE_TIMEOUT_MS,
  TRACKED_EVENTS,
};
