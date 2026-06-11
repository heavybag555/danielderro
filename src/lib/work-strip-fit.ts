type SanityImageField = {
  asset: { _ref: string };
};

export const THUMB_FALLBACK_ASPECT = 4 / 3;

/** Parse intrinsic dimensions from a Sanity asset `_ref`, e.g. `image-<hash>-1920x1080-jpg`. */
export function getSanityImageDims(
  image: SanityImageField,
): { width: number; height: number } | null {
  const match = image.asset?._ref?.match(/-(\d+)x(\d+)-[a-z0-9]+$/i);
  if (!match) return null;
  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!width || !height) return null;
  return { width, height };
}

export function getThumbWidth(image: SanityImageField, height: number): number {
  const dims = getSanityImageDims(image);
  const aspect = dims ? dims.width / dims.height : THUMB_FALLBACK_ASPECT;
  return Math.max(1, Math.round(height * aspect));
}

/** How many thumbnails fit in `availableWidth` without clipping. */
export function countFittingThumbnails(
  images: SanityImageField[],
  height: number,
  availableWidth: number,
): number {
  if (images.length === 0 || availableWidth <= 0) return 0;

  let used = 0;
  for (let i = 0; i < images.length; i++) {
    const w = getThumbWidth(images[i], height);
    if (i === 0 && w > availableWidth) return 1;
    if (used + w > availableWidth) return i;
    used += w;
  }
  return images.length;
}
