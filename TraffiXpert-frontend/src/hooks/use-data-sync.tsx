import * as React from "react";

const DEBOUNCE_DEFAULT_MS = 300;

/**
 * Custom hook that debounces a rapidly changing value.
 * Useful for search inputs, slider controls, or any frequently
 * updated state that triggers expensive operations.
 *
 * @param value The value to debounce
 * @param delay Debounce delay in milliseconds (default: 300ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = DEBOUNCE_DEFAULT_MS): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for polling an async function at a configurable interval.
 * Automatically pauses when the document is hidden (tab not active)
 * and resumes when the tab regains focus.
 *
 * @param callback Async function to execute on each interval
 * @param intervalMs Polling interval in milliseconds
 * @param enabled Whether polling is active (default: true)
 */
export function usePolling(
  callback: () => Promise<void> | void,
  intervalMs: number,
  enabled: boolean = true
): { isPolling: boolean; lastPollTime: number | null } {
  const [isPolling, setIsPolling] = React.useState(false);
  const [lastPollTime, setLastPollTime] = React.useState<number | null>(null);
  const savedCallback = React.useRef(callback);

  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  React.useEffect(() => {
    if (!enabled || intervalMs <= 0) {
      setIsPolling(false);
      return;
    }

    let isMounted = true;

    const executePoll = async () => {
      if (!isMounted || document.hidden) return;
      setIsPolling(true);
      try {
        await savedCallback.current();
        if (isMounted) {
          setLastPollTime(Date.now());
        }
      } catch (error) {
        console.error("[usePolling] Poll execution failed:", error);
      } finally {
        if (isMounted) setIsPolling(false);
      }
    };

    // Execute immediately on mount
    executePoll();

    const intervalId = setInterval(executePoll, intervalMs);

    const handleVisibilityChange = () => {
      if (!document.hidden && isMounted) {
        executePoll();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [intervalMs, enabled]);

  return { isPolling, lastPollTime };
}
