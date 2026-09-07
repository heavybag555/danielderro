"use client";

import { useEffect, type RefObject } from "react";
import { animate, type AnimationPlaybackControls } from "framer-motion";
import { MOTION } from "@/lib/motion";
import { wheelDeltaPx } from "@/lib/smooth-scroll";

/** Wheel travel that counts as a swipe (one mouse tick is ~100px). */
const SWIPE_THRESHOLD_PX = 16;
/**
 * Deltas below this are surface jitter (a finger resting on a Magic Mouse,
 * the last crumbs of a momentum tail). They never extend or start a gesture.
 */
const NOISE_PX = 4;
/**
 * Telling a new swipe from the tail of the last one. Inertia only ever decays
 * and never pauses or flips, so any of these is the hand, not the tail:
 * a gap in the stream, a direction flip, one big jump (3x), or two rises in a
 * row. A single 2x spike alone is not enough; a stalled frame coalesces two
 * tail events into one and would look exactly like that.
 */
const FRESH_MIN_PX = 12;
const FRESH_GAP_MS = 120;
const FRESH_JUMP_GAIN = 3;
const FRESH_RISE_GAIN = 1.3;
/**
 * A swipe's own ramp accelerates for its first ~100ms; do not read that as a
 * second swipe. Humans cannot repeat a swipe faster than this anyway.
 */
const REFRACTORY_MS = 150;
/** Silence after the slide lands that ends the gesture, swallowing inertia. */
const GESTURE_QUIET_MS = 120;
/** Debounce before an external move (scrollbar drag) settles onto a slide. */
const SETTLE_MS = 140;

const INTERACTIVE_SELECTOR =
  "input, textarea, select, button, a, [contenteditable], .project-video-frame";

/**
 * Desktop project deck: one slide per gesture, no dead time. A swipe or key
 * press glides to the next slide and locks against the momentum tail that
 * follows, so a Magic Mouse or trackpad flick can never skip a slide. A fresh
 * swipe (see FRESH_*) is honoured immediately, even mid-travel, retargeting
 * from wherever the deck is. Touch and reduced motion keep the native CSS
 * snap deck.
 */
export function useSlideDeck(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;

    el.dataset.slideEngine = "true";

    let controls: AnimationPlaybackControls | null = null;
    let locked = false;
    let accumulated = 0;
    /** Shape of the wheel stream, for tail-vs-swipe checks. */
    let lastAbsDy = 0;
    let lastSign = 0;
    let lastRising = false;
    let lastEventAt = 0;
    let lastTriggerAt = 0;
    let index = 0;
    let unlockTimer = 0;
    let settleTimer = 0;
    /** Slide tops, measured per layout so the wheel handler touches no DOM. */
    let offsets: number[] = [];

    const measure = () => {
      offsets = Array.from(
        el.querySelectorAll<HTMLElement>("[data-slide-index]"),
        (slide) => slide.offsetTop,
      );
      index = Math.max(0, Math.min(index, offsets.length - 1));
    };

    const nearestIndex = () => {
      let best = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      for (let i = 0; i < offsets.length; i += 1) {
        const distance = Math.abs(offsets[i] - el.scrollTop);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = i;
        }
      }
      return best;
    };

    /** Release the lock once travel is done and the gesture has gone quiet. */
    const endGesture = () => {
      window.clearTimeout(unlockTimer);
      if (controls) return;
      unlockTimer = window.setTimeout(() => {
        locked = false;
        accumulated = 0;
      }, GESTURE_QUIET_MS);
    };

    const goTo = (next: number) => {
      if (offsets.length === 0) return;
      index = Math.max(0, Math.min(offsets.length - 1, next));
      const to = offsets[index];
      const from = el.scrollTop;
      controls?.stop();
      controls = null;
      if (Math.abs(to - from) < 1) {
        el.scrollTop = to;
        endGesture();
        return;
      }
      // Ease-out: motion starts the instant you swipe, then settles.
      controls = animate(from, to, {
        duration: MOTION.duration.slideDeck,
        ease: MOTION.ease.out,
        onUpdate: (value) => {
          el.scrollTop = value;
        },
        onComplete: () => {
          controls = null;
          endGesture();
        },
      });
    };

    const step = (direction: number) => {
      window.clearTimeout(unlockTimer);
      locked = true;
      accumulated = 0;
      lastTriggerAt = performance.now();
      goTo(index + direction);
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      const { dx, dy } = wheelDeltaPx(event);
      if (dy === 0 || Math.abs(dx) > Math.abs(dy) * 2) return;
      // The deck owns the vertical axis; native scroll would fight the glide.
      event.preventDefault();

      const absDy = Math.abs(dy);
      // Jitter never counts: not as inertia, not as intent.
      if (absDy < NOISE_PX) return;

      const now = performance.now();
      const sign = dy > 0 ? 1 : -1;
      const rising = absDy > lastAbsDy * FRESH_RISE_GAIN;
      const fresh =
        absDy >= FRESH_MIN_PX &&
        (now - lastEventAt > FRESH_GAP_MS ||
          sign !== lastSign ||
          absDy > lastAbsDy * FRESH_JUMP_GAIN ||
          (rising && lastRising));
      lastAbsDy = absDy;
      lastSign = sign;
      lastRising = rising;
      lastEventAt = now;

      if (locked) {
        if (fresh && now - lastTriggerAt > REFRACTORY_MS) {
          // The hand again: go now, from wherever the deck is.
          step(sign);
          return;
        }
        // Still the old tail: once landed, keep the lock alive until it decays.
        if (!controls) endGesture();
        return;
      }

      if (sign !== Math.sign(accumulated)) accumulated = 0;
      accumulated += dy;
      if (Math.abs(accumulated) < SWIPE_THRESHOLD_PX) return;
      step(sign);
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
          step(-index);
          return;
        case "End":
          event.preventDefault();
          step(offsets.length - 1 - index);
          return;
        default:
          return;
      }
      event.preventDefault();
      // Key repeat is rate-limited to one slide per refractory window; a
      // deliberate second press mid-travel retargets at once.
      if (performance.now() - lastTriggerAt < REFRACTORY_MS) return;
      step(direction);
    };

    // Scrollbar drag or any move we did not animate: rest on the closest slide.
    const onScroll = () => {
      if (controls || locked) return;
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        const nearest = nearestIndex();
        index = nearest;
        if (offsets[nearest] !== undefined) {
          goTo(nearest);
        }
      }, SETTLE_MS);
    };

    // Slides are viewport-tall; keep the current one flush when the window resizes.
    const observer = new ResizeObserver(() => {
      measure();
      if (controls) return;
      if (offsets[index] !== undefined) el.scrollTop = offsets[index];
    });
    observer.observe(el);

    measure();
    index = nearestIndex();

    // Capture on the window so a swipe over the brand strip or footer still pages.
    window.addEventListener("wheel", onWheel, { capture: true, passive: false });
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      controls?.stop();
      window.clearTimeout(unlockTimer);
      window.clearTimeout(settleTimer);
      observer.disconnect();
      window.removeEventListener("wheel", onWheel, { capture: true });
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKeyDown);
      delete el.dataset.slideEngine;
    };
  }, [ref, enabled]);
}
