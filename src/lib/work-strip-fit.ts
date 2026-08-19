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

export function getThumbAspect(image: SanityImageField): number {
  const dims = getSanityImageDims(image);
  return dims ? dims.width / dims.height : THUMB_FALLBACK_ASPECT;
}

/**
 * Total width of a strip whose thumbnails are one unit tall. Dividing the available
 * row width by this sum gives the height at which the strip fills that width exactly.
 */
export function sumThumbAspects(images: SanityImageField[]): number {
  let sum = 0;
  for (const image of images) sum += getThumbAspect(image);
  return sum > 0 ? sum : THUMB_FALLBACK_ASPECT;
}
