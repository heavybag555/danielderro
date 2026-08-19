/** Sentinel id on the home page: top edge of the gallery (see `page.tsx`). */
export const HOME_GALLERY_FADE_ANCHOR_ID = "home-gallery-fade-anchor";

type SanityImageField = {
  asset: { _ref: string };
  hotspot?: { x: number; y: number };
};

type GalleryImage = {
  _type: "imageAsset";
  _key: string;
  image?: SanityImageField;
  caption?: string;
  alt?: string;
};

type GalleryVideo = {
  _type: "videoAsset";
  _key: string;
  thumbnail?: SanityImageField;
  caption?: string;
  title?: string;
};

type GalleryEntry = GalleryImage | GalleryVideo;

export type HomeGalleryProject = {
  _id: string;
  title: string;
  slug?: { current: string };
  client?: string;
  tags?: string[];
  gallery?: GalleryEntry[];
};

export type HomeGalleryStill = {
  _key: string;
  slug: string;
  title: string;
  client?: string;
  tags: string[];
  image: SanityImageField;
  alt: string;
};

const GALLERY_COLUMNS = 8;
const GALLERY_ROWS = 10;
const MAX_IMAGES = GALLERY_COLUMNS * GALLERY_ROWS;

export const HOME_GALLERY_MOBILE_COLUMNS = 2;
export const HOME_GALLERY_MOBILE_ROWS = 6;
export const HOME_GALLERY_MOBILE_MAX =
  HOME_GALLERY_MOBILE_COLUMNS * HOME_GALLERY_MOBILE_ROWS;

/** Trim to complete rows; optional cap for breakpoint-specific limits. */
export function trimGalleryToFullRows(
  stills: HomeGalleryStill[],
  columns: number,
  maxImages = stills.length,
): HomeGalleryStill[] {
  const capped = stills.slice(0, maxImages);
  const fullRows = Math.floor(capped.length / columns) * columns;
  return capped.slice(0, fullRows);
}

function projectStills(project: HomeGalleryProject): HomeGalleryStill[] {
  const slug = project.slug?.current;
  if (!slug) return [];

  const out: HomeGalleryStill[] = [];
  for (const entry of project.gallery ?? []) {
    if (entry._type === "imageAsset" && entry.image?.asset?._ref) {
      out.push({
        _key: `${project._id}__${entry._key}`,
        slug,
        title: project.title,
        client: project.client,
        tags: project.tags ?? [],
        image: entry.image,
        alt: entry.alt?.trim() || entry.caption?.trim() || "",
      });
    } else if (entry._type === "videoAsset" && entry.thumbnail?.asset?._ref) {
      out.push({
        _key: `${project._id}__${entry._key}`,
        slug,
        title: project.title,
        client: project.client,
        tags: project.tags ?? [],
        image: entry.thumbnail,
        alt: entry.caption?.trim() || entry.title?.trim() || "",
      });
    }
  }
  return out;
}

/**
 * Deterministic round-robin across projects so adjacent tiles tend to come from
 * different work. Stable across reloads (no randomness, no client storage),
 * capped to whole rows of eight and at most {@link MAX_IMAGES} images.
 */
export function buildHomeGallery(
  projects: HomeGalleryProject[],
): HomeGalleryStill[] {
  const perProject = projects
    .map(projectStills)
    .filter((stills) => stills.length > 0);

  if (perProject.length === 0) return [];

  const result: HomeGalleryStill[] = [];
  const cursors = perProject.map(() => 0);

  while (result.length < MAX_IMAGES) {
    let addedAny = false;
    for (let p = 0; p < perProject.length && result.length < MAX_IMAGES; p++) {
      const cursor = cursors[p];
      if (cursor < perProject[p].length) {
        result.push(perProject[p][cursor]);
        cursors[p]++;
        addedAny = true;
      }
    }
    if (!addedAny) break;
  }

  const fullRows = Math.floor(result.length / GALLERY_COLUMNS) * GALLERY_COLUMNS;
  return result.slice(0, fullRows);
}
