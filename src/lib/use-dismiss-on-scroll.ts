"use client";

import { useEffect, useRef } from "react";

/**
 * Runs `dismiss` when the page scrolls — used by the work and gallery indexes
 * to drop transient hover state the pointer has effectively left behind.
 *
 * Throttled to one call per animation frame so a fast scroll cannot queue a
 * callback per event, and the handler is registered once regardless of how
 * often `dismiss` is re-created during render.
 */
export function useDismissOnScroll(dismiss: () => void) {
  const dismissRef = useRef(dismiss);
  dismissRef.current = dismiss;

  useEffect(() => {
    let frame = 0;

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        dismissRef.current();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
}
