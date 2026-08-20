import { createImageUrlBuilder } from "@sanity/image-url";
import type { ImageLoader } from "next/image";
import { client } from "./client";

const builder = createImageUrlBuilder(client);

type ImageSource = Parameters<typeof builder.image>[0];

export function urlFor(source: ImageSource) {
  return builder.image(source);
}

/**
 * Returns a base Sanity CDN URL with format negotiation and fit-max
 * (never upscale beyond original). Width and quality are left for the
 * loader so Next.js can generate proper srcset breakpoints.
 */
export function sanityImageUrl(source: ImageSource): string {
  return builder.image(source).auto("format").fit("max").url();
}

/** Tiny blurred CDN URL — project slide fallback only when full image is slow. */
export function sanityImageBlurUrl(source: ImageSource): string {
  return builder.image(source).width(32).blur(50).auto("format").fit("max").url();
}

/**
 * Max CDN width for project detail slides (object-fit contain in padded viewport).
 * Sized for retina desktops — `fit("max")` still prevents upscaling past the master.
 */
export const PROJECT_SLIDE_MAX_WIDTH = 2560;

/** Project slides are the portfolio artwork, so they carry the site's highest quality. */
export const PROJECT_SLIDE_QUALITY = 90;

/**
 * Custom loader for next/image — lets Sanity CDN handle all image
 * processing in a single pass, eliminating double compression from
 * Next.js's built-in optimizer.
 */
export const sanityLoader: ImageLoader = ({ src, width, quality }) => {
  const url = new URL(src);
  url.searchParams.set("w", width.toString());
  url.searchParams.set("q", (quality ?? 90).toString());
  return url.toString();
};

/** Project slide loader — caps width/quality so srcset never over-fetches. */
export const projectSlideLoader: ImageLoader = ({ src, width, quality }) => {
  return sanityLoader({
    src,
    width: Math.min(width, PROJECT_SLIDE_MAX_WIDTH),
    quality: quality ?? PROJECT_SLIDE_QUALITY,
  });
};

/** Direct CDN URL for preload/prefetch (bypasses next/image srcset). */
export function projectSlideImageUrl(
  source: ImageSource,
  width = PROJECT_SLIDE_MAX_WIDTH,
): string {
  return projectSlideLoader({
    src: sanityImageUrl(source),
    width: Math.min(width, PROJECT_SLIDE_MAX_WIDTH),
    quality: PROJECT_SLIDE_QUALITY,
  });
}
