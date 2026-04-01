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
