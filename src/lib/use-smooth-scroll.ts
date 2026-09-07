"use client";

import { useEffect, type RefObject } from "react";
import { SmoothScroll, SMOOTH_SCROLL_QUERY } from "@/lib/smooth-scroll";
import { useMediaQuery } from "@/lib/use-media-query";

/** Desktop, fine pointer, motion allowed. False until mounted (SSR-safe). */
export function useSmoothScrollEnabled(): boolean {
  return useMediaQuery(SMOOTH_SCROLL_QUERY);
}

/**
 * Give a nested vertical scroller (radio lists) the same damped wheel glide
 * as the page. The engine is created once the element exists and torn down
 * when it unmounts or the breakpoint flips.
 */
export function useSmoothScrollElement(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    const engine = new SmoothScroll(el);
    return () => engine.destroy();
  }, [ref, enabled]);
}
