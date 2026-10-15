/**
 * Candidate widths `next/image` builds its srcset from. Single source of truth:
 * `next.config.ts` feeds this straight into `images.deviceSizes`, and anything
 * that hand-rolls a preload or prefetch picks from the same list so it warms
 * the exact URL the rendered <img> will choose.
 */
export const IMAGE_DEVICE_SIZES = [
  640, 750, 828, 1080, 1200, 1920, 2048, 2560, 3840,
];

/** Smallest candidate that covers `needed` device pixels. */
export function pickDeviceSize(needed: number): number {
  return (
    IMAGE_DEVICE_SIZES.find((width) => width >= needed) ??
    IMAGE_DEVICE_SIZES[IMAGE_DEVICE_SIZES.length - 1]
  );
}
