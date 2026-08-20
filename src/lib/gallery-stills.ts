import { sanityImageUrl } from "@/sanity/lib/image";
import { getThumbAspect, THUMB_FALLBACK_ASPECT } from "@/lib/work-strip-fit";
import type { WorkProject } from "@/components/WorkProjectGrid";

export type GalleryStill = {
  key: string;
  slug: string;
  title: string;
  client: string;
  tags: string;
  src: string;
  aspect: number;
  remote: boolean;
};

const TAG_LABELS: Record<string, string> = {
  editorial: "Editorial",
  campaign: "Campaign",
};

function clientLabel(project: WorkProject): string {
  const client = project.client?.trim();
  if (client) return client;
  if (project.tags?.includes("no-school-studio")) return "No School Studio";
  return "Personal";
}

function tagsLabel(project: WorkProject): string {
  const labels: string[] = [];
  for (const tag of project.tags ?? []) {
    const label = TAG_LABELS[tag];
    if (label) labels.push(label);
  }
  if (project.projectType === "photography") labels.push("Stills");
  else if (project.projectType === "video") labels.push("Motion");
  else if (project.projectType) {
    labels.push(
      project.projectType.charAt(0).toUpperCase() + project.projectType.slice(1),
    );
  }
  return labels.join(", ");
}

const THUMB_MAX = 24;
/** Enough stills to pack an 8-col grid through the first viewport and beyond. */
const MIN_TILES = 64;
const MAX_TILES = 96;

function projectStills(project: WorkProject): GalleryStill[] {
  const slug = project.slug?.current;
  if (!slug) return [];

  const stills: GalleryStill[] = [];
  const seen = new Set<string>();

  const push = (src: string, remote: boolean, id: string, aspect: number) => {
    if (!src || seen.has(src)) return;
    seen.add(src);
    stills.push({
      key: `${project._id}__${id}`,
      slug,
      title: project.title,
      client: clientLabel(project),
      tags: tagsLabel(project),
      src,
      aspect,
      remote,
    });
  };

  const external = project.externalCover;
  if (external?.src) {
    push(
      external.src,
      true,
      external.src,
      external.width && external.height
        ? external.width / external.height
        : THUMB_FALLBACK_ASPECT,
    );
  }

  const images = [
    project.coverImage,
    ...(project.galleryThumbs ?? []).map((thumb) => thumb?.image),
  ];

  for (const image of images) {
    const ref = image?.asset?._ref;
    if (!ref) continue;
    push(sanityImageUrl(image), false, ref, getThumbAspect(image));
    if (stills.length >= THUMB_MAX) break;
  }

  return stills;
}

/**
 * Round-robin stills across projects, pad to fill the grid, then shuffle
 * once. Shuffle on the server so hover/re-render does not reorder tiles.
 */
export function buildGalleryStills(projects: WorkProject[]): GalleryStill[] {
  const perProject = projects
    .map(projectStills)
    .filter((stills) => stills.length > 0);

  if (perProject.length === 0) return [];

  const mixed: GalleryStill[] = [];
  const cursors = perProject.map(() => 0);
  const uniqueLimit = Math.min(
    MAX_TILES,
    perProject.reduce((sum, stills) => sum + stills.length, 0),
  );

  while (mixed.length < uniqueLimit) {
    let added = false;
    for (let i = 0; i < perProject.length && mixed.length < uniqueLimit; i++) {
      const cursor = cursors[i];
      if (cursor < perProject[i].length) {
        mixed.push(perProject[i][cursor]);
        cursors[i] += 1;
        added = true;
      }
    }
    if (!added) break;
  }

  if (mixed.length === 0) return [];

  const filled = [...mixed];
  let repeat = 0;
  while (filled.length < MIN_TILES && filled.length < MAX_TILES) {
    const source = mixed[filled.length % mixed.length];
    filled.push({
      ...source,
      key: `${source.key}__r${repeat}`,
    });
    repeat += 1;
  }

  return shuffleOnce(filled.slice(0, MAX_TILES));
}

/** One Fisher–Yates pass. Call on the server so the client never reshuffles. */
function shuffleOnce<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = swap;
  }
  return shuffled;
}
