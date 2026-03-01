import imageUrlBuilder from "@sanity/image-url";
import { getClient } from "./client";

const MAX_WIDTH = 2400;
const MAX_QUALITY = 85;

let _builder: ReturnType<typeof imageUrlBuilder> | null = null;

function getBuilder() {
  if (!_builder) {
    _builder = imageUrlBuilder(getClient());
  }
  return _builder;
}

/**
 * Build a Sanity CDN image URL (server-side only).
 * Enforces hard caps on width/quality so originals are never served.
 */
export function buildImageUrl(
  ref: string,
  opts: { width?: number; height?: number; quality?: number } = {},
) {
  const width = Math.min(opts.width ?? MAX_WIDTH, MAX_WIDTH);
  const quality = Math.min(opts.quality ?? MAX_QUALITY, MAX_QUALITY);

  let img = getBuilder()
    .image(ref)
    .auto("format")
    .quality(quality)
    .width(width);

  if (opts.height) {
    img = img.height(opts.height);
  }

  return img.url();
}
