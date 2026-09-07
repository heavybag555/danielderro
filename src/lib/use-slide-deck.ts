"use client";

import { useEffect, type RefObject } from "react";
import { animate, type AnimationPlaybackControls } from "framer-motion";
import { MOTION } from "@/lib/motion";
import { wheelDeltaPx } from "@/lib/smooth-scroll";

/** Wheel travel that counts as a deliberate gesture (one mouse tick is ~100px). */
const GESTURE_THRESHOLD_PX = 24;
/** Silence between wheel events that separates one gesture from the next. */
const GESTURE_QUIET_MS = 90;
/** Debounce before an external move (scrollbar drag) settles onto a slide. */
const SETTLE_MS = 140;

const INTERACTIVE_SELECTOR =
  "input, textarea, select, button, a, [contenteditable], .project-video-frame";

/**
 * Desktop project deck: replaces CSS scroll-snap with one slide per wheel
 * gesture (or key press), travelling on the site's heavy curve. Trackpad
 * inertia after a swipe is swallowed until the gesture goes quiet, so a flick
 * never skips slides. Disabled → the native snap deck is untouched.
 */
export function useSlideDeck(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;

    el.dataset.slideEngine = "true";

    let controls: AnimationPlaybackControls | null = null;
    let animating = false;
    let locked = false;
    let accumulated = 0;
    let lastWheelAt = 0;
    let settleTimer = 0;

    const slides = () =>
      Array.from(el.querySelectorAll<HTMLElement>("[data-slide-index]"));

    const nearestIndex = () => {
      const y = el.scrollTop;
      let best = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      slides().forEach((slide, i) => {
        const distance = Math.abs(slide.offsetTop - y);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = i;
        }
      });
      return best;
    };

    let index = nearestIndex();

    const goTo = (next: number) => {
      const list = slides();
      if (list.length === 0) return;
      index = Math.min(list.length - 1, Math.max(0, next));
      const to = list[index].offsetTop;
      const from = el.scrollTop;
      controls?.stop();
      if (Math.abs(to - from) < 1) {
        el.scrollTop = to;
        return;
      }
      animating = true;
      controls = animate(from, to, {
        duration: MOTION.duration.slow,
        ease: MOTION.ease.heavy,
        onUpdate: (value) => {
          el.scrollTop = value;
        },
        onComplete: () => {
          animating = false;
          controls = null;
        },
      });
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      const { dx, dy } = wheelDeltaPx(event);
      if (dy === 0 || Math.abs(dx) > Math.abs(dy)) return;
      event.preventDefault();

      const now = performance.now();
      const quiet = now - lastWheelAt > GESTURE_QUIET_MS;
      lastWheelAt = now;

      if (locked) {
        // Still the same gesture (inertia) or still travelling: swallow.
        if (!quiet || animating) return;
        locked = false;
        accumulated = 0;
      } else if (quiet) {
        accumulated = 0;
      }

      accumulated += dy;
      if (Math.abs(accumulated) < GESTURE_THRESHOLD_PX) return;

      const direction = accumulated > 0 ? 1 : -1;
      accumulated = 0;
      locked = true;
      goTo(index + direction);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target !== document.body &&
        target.closest(INTERACTIVE_SELECTOR)
      ) {
        return;
      }
      let direction = 0;
      switch (event.key) {
        case "ArrowDown":
        case "PageDown":
          direction = 1;
          break;
        case "ArrowUp":
        case "PageUp":
          direction = -1;
          break;
        case " ":
          direction = event.shiftKey ? -1 : 1;
          break;
        case "Home":
          event.preventDefault();
          goTo(0);
          return;
        case "End":
          event.preventDefault();
          goTo(Number.POSITIVE_INFINITY);
          return;
        default:
          return;
      }
      event.preventDefault();
      goTo(index + direction);
    };

    // Scrollbar drag or any move we did not animate: rest on the closest slide.
    const onScroll = () => {
      if (animating) return;
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        const nearest = nearestIndex();
        const list = slides();
        index = nearest;
        if (list[nearest] && Math.abs(list[nearest].offsetTop - el.scrollTop) >= 1) {
          goTo(nearest);
        }
      }, SETTLE_MS);
    };

    // Slides are viewport-tall; keep the current one flush when the window resizes.
    const observer = new ResizeObserver(() => {
      if (animating) return;
      const slide = slides()[index];
      if (slide) el.scrollTop = slide.offsetTop;
    });
    observer.observe(el);

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      controls?.stop();
      window.clearTimeout(settleTimer);
      observer.disconnect();
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKeyDown);
      delete el.dataset.slideEngine;
    };
  }, [ref, enabled]);
}
