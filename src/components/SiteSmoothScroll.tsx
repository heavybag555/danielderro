"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { SmoothScroll } from "@/lib/smooth-scroll";
import { useSmoothScrollEnabled } from "@/lib/use-smooth-scroll";

/**
 * Page-level smooth scroll for the window (work, info). Desktop only; Studio
 * keeps its own panes. Surfaces that own their wheel (gallery dome, project
 * deck, radio lists) preventDefault or are detected as nested scrollers, so a
 * single window engine is safe to keep mounted on every route.
 */
export default function SiteSmoothScroll() {
  const pathname = usePathname();
  const enabled = useSmoothScrollEnabled() && !pathname.startsWith("/studio");
  const engine = useRef<SmoothScroll | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const instance = new SmoothScroll(window);
    engine.current = instance;
    return () => {
      instance.destroy();
      engine.current = null;
    };
  }, [enabled]);

  // Route change: Next resets the window position; rest there instead of
  // finishing a glide that belonged to the previous page.
  useEffect(() => {
    engine.current?.reset();
  }, [pathname]);

  return null;
}
