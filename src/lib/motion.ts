export const MOTION = {
  duration: {
    page: 0.8,
    hover: 0.6,
    fade: 0.5,
    /** Project gallery image crossfade (fast advance). */
    gallerySlide: 0.12,
    slow: 1.2,
  },
  ease: {
    heavy: [0.76, 0, 0.24, 1],
    out: [0.25, 0.1, 0.25, 1],
    inOut: [0.4, 0, 0.2, 1],
  },
} as const;

/** Phone measure. Read at animation time so it does not depend on React state. */
function isMobileViewport(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 767px)").matches
  );
}

/**
 * Opacity-only enter for image lists (gallery tiles, work rows).
 * Blur is reserved for text — filtering dozens of photos at once is what
 * made the stagger feel choppy on mobile. The delay is capped so tiles
 * below the fold fade together instead of keeping the GPU busy.
 */
export function mediaEnterTransition(index: number) {
  const mobile = isMobileViewport();
  return {
    duration: mobile ? 0.45 : 0.6,
    ease: MOTION.ease.heavy,
    delay: Math.min(index * (mobile ? 0.06 : 0.03), mobile ? 0.36 : 0.48),
  };
}
