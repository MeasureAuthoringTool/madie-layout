import { useLayoutEffect, useState } from "react";

export const useIsOverflow = (ref, callback) => {
  // manual track
  const [isOverflow, setIsOverflow] = useState(undefined);
  useLayoutEffect(() => {
    // expected ref. track on layout render
    const { current } = ref;
    const trigger = () => {
      // if overflow
      const hasOverflow = current.scrollWidth > current.clientWidth;
      setIsOverflow(hasOverflow);
      // pass truthy value
      if (callback) callback(hasOverflow);
    };

    if (current) {
      if ("ResizeObserver" in window) {
        // track on resize events.
        new ResizeObserver(trigger).observe(current);
      }
      trigger();
    }
  }, [callback, ref]);

  return isOverflow;
};
