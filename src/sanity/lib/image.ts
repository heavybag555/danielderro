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
