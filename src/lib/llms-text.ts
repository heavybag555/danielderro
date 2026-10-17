import { projectClientLabel, projectTagsLabel } from "@/lib/project-meta";
import {
  SITE_CONTACT_EMAIL,
  SITE_CONTACT_MAILTO,
  SITE_INSTAGRAM_DANIEL_DERRO,
  SITE_INSTAGRAM_NO_SCHOOL_STUDIO_RECORDS,
} from "@/lib/site-contact";
import {
  HOME_HERO_LINES,
  INFO_ABOUT,
  INFO_SERVICES,
  RADIO_EPISODES,
  RADIO_INTRO,
  SITE_ABOUT_COPY,
  SITE_CLIENTS,
} from "@/lib/site-content";
import { SITE_NAME, SITE_URL } from "@/lib/site-metadata";
import { SITE_NAV_ITEMS } from "@/lib/site-nav";

export type LlmsProjectMedia = {
  _type?: string;
  alt?: string;
  caption?: string;
  title?: string;
};

export type LlmsProject = {
  _id?: string;
  slug?: string;
  title?: string;
  client?: string;
  projectType?: string;
  tags?: string[];
  date?: string;
  description?: string;
  media?: (LlmsProjectMedia | null)[];
};

const HOME_SUMMARY = HOME_HERO_LINES.join(" ");

/** One-line notes for the fixed site surfaces, keyed by nav href. */
const PAGE_NOTES: Record<string, string> = {
  "/": "The studio statement over the intro film.",
  "/work": "Index of every project, filterable by Stills, Motion, and No School.",
  "/gallery": "Stills drawn from across the projects; every tile links to its project page.",
  "/info": "About, services, client list, and contact details.",
  "/radio": "Identity Correction Radio — episodes and tracklists.",
};

/** Canonical paths of the two Markdown files; the `.txt` twins 308 here. */
export const LLMS_INDEX_PATH = "/llms.md";
export const LLMS_FULL_PATH = "/llms-full.md";

export function absoluteUrl(path: string): string {
  return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

function clean(value?: string | null): string {
  return (value ?? "").replace(/\r\n/g, "\n").trim();
}

/** Square brackets in a title would otherwise break the surrounding link. */
function linkText(value: string): string {
  return value.replace(/([[\]])/g, "\\$1");
}

function paragraphs(value: string): string[] {
  return value
    .split(/\n{2,}/)
    .map((block) => block.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}

function projectYear(project: LlmsProject): string {
  const year = clean(project.date).slice(0, 4);
  return /^\d{4}$/.test(year) ? year : "";
}

function projectUrl(project: LlmsProject): string {
  return absoluteUrl(`/work/${project.slug}`);
}

function projectMedia(project: LlmsProject): LlmsProjectMedia[] {
  return (project.media ?? []).filter((item): item is LlmsProjectMedia => Boolean(item));
}

/** Image alt text (falling back to the caption) doubles as a short description. */
function mediaDescriptions(project: LlmsProject): string[] {
  const seen = new Set<string>();
  const descriptions: string[] = [];
  for (const item of projectMedia(project)) {
    const text = clean(item.alt) || clean(item.caption) || clean(item.title);
    if (!text || seen.has(text)) continue;
    seen.add(text);
    descriptions.push(text);
  }
  return descriptions;
}

function mediaCounts(project: LlmsProject): string {
  const media = projectMedia(project);
  const images = media.filter((item) => item._type === "imageAsset").length;
  const videos = media.filter((item) => item._type === "videoAsset").length;
  const parts: string[] = [];
  if (images) parts.push(`${images} ${images === 1 ? "image" : "images"}`);
  if (videos) parts.push(`${videos} ${videos === 1 ? "video" : "videos"}`);
  return parts.join(", ");
}

function usableProjects(projects: LlmsProject[]): LlmsProject[] {
  return projects.filter((project) => clean(project.slug) && clean(project.title));
}

/** `Client — Title — Category, Year`, the caption row the work and gallery indexes print. */
function captionLine(project: LlmsProject): string {
  const parts = [projectClientLabel(project), clean(project.title)];
  const tags = projectTagsLabel(project);
  if (tags) parts.push(tags);
  const year = projectYear(project);
  if (year) parts.push(year);
  return parts.join(" — ");
}

/**
 * `/llms.md` — the llmstxt.org index: name, summary, then link sections.
 */
export function buildLlmsIndex(projects: LlmsProject[]): string {
  const lines: string[] = [
    `# ${SITE_NAME}`,
    "",
    `> ${HOME_SUMMARY}`,
    "",
    SITE_ABOUT_COPY,
    "",
    "## Pages",
    "",
    `- [Home](${absoluteUrl("/")}): ${PAGE_NOTES["/"]}`,
  ];

  for (const item of SITE_NAV_ITEMS) {
    const note = PAGE_NOTES[item.href];
    lines.push(
      `- [${linkText(item.label)}](${absoluteUrl(item.href)})${note ? `: ${note}` : ""}`,
    );
  }

  const work = usableProjects(projects);
  if (work.length > 0) {
    lines.push("", "## Work", "");
    for (const project of work) {
      const meta = [projectClientLabel(project), projectTagsLabel(project), projectYear(project)]
        .filter(Boolean)
        .join(" — ");
      lines.push(
        `- [${linkText(clean(project.title))}](${projectUrl(project)})${meta ? `: ${meta}` : ""}`,
      );
    }
  }

  lines.push("", "## Radio", "");
  for (const episode of RADIO_EPISODES) {
    const meta = [
      `${episode.tracklist.length} ${episode.tracklist.length === 1 ? "track" : "tracks"}`,
      episode.durationLabel,
    ]
      .filter(Boolean)
      .join(", ");
    lines.push(`- [${linkText(episode.title)}](${episode.mixcloudUrl}): ${meta}`);
  }

  lines.push(
    "",
    "## Full text",
    "",
    `- [Full site text](${absoluteUrl(LLMS_FULL_PATH)}): Every page and project on this site as one Markdown document.`,
    `- [Sitemap](${absoluteUrl("/sitemap.xml")}): Every indexable URL.`,
    "",
  );

  return lines.join("\n");
}

/**
 * `/llms-full.md` — every page of site copy as one Markdown document.
 */
export function buildLlmsFullText(projects: LlmsProject[]): string {
  const lines: string[] = [
    `# ${SITE_NAME}`,
    "",
    `> ${HOME_SUMMARY}`,
    "",
    `The full text of ${absoluteUrl("/")}, as Markdown.`,
    "",
    "## Introduction",
    "",
    ...HOME_HERO_LINES,
    "",
    SITE_ABOUT_COPY,
    "",
    "Pages:",
    "",
    `- [Home](${absoluteUrl("/")})`,
    ...SITE_NAV_ITEMS.map((item) => `- [${linkText(item.label)}](${absoluteUrl(item.href)})`),
  ];

  const work = usableProjects(projects);

  lines.push(
    "",
    "## Work",
    "",
    work.length > 0
      ? `Every project on [Work](${absoluteUrl("/work")}), newest first.`
      : `The project index lives at [Work](${absoluteUrl("/work")}).`,
  );

  for (const project of work) {
    const title = clean(project.title);
    const year = projectYear(project);
    const tags = projectTagsLabel(project);
    const counts = mediaCounts(project);

    lines.push("", `### ${title}`, "");
    lines.push(`- Page: ${projectUrl(project)}`);
    lines.push(`- Client: ${projectClientLabel(project)}`);
    if (year) lines.push(`- Year: ${year}`);
    if (tags) lines.push(`- Category: ${tags}`);
    if (counts) lines.push(`- Media: ${counts}`);

    const description = clean(project.description);
    if (description) {
      for (const paragraph of paragraphs(description)) lines.push("", paragraph);
    }

    const descriptions = mediaDescriptions(project);
    if (descriptions.length > 0) {
      lines.push("", "Media:", "");
      for (const text of descriptions) lines.push(`- ${text}`);
    }
  }

  lines.push(
    "",
    "## Gallery",
    "",
    `[Gallery](${absoluteUrl("/gallery")}) is a stills index built from the projects above. Each tile links to its project page and is captioned with the client, the title, and the category.`,
  );

  if (work.length > 0) {
    lines.push("", "Captions:", "");
    for (const project of work) {
      lines.push(`- ${captionLine(project)}: ${projectUrl(project)}`);
    }
  }

  lines.push("", "## Info", "", `[Info](${absoluteUrl("/info")})`, "", "### About", "");
  for (const paragraph of INFO_ABOUT) lines.push(paragraph, "");

  lines.push("### Services", "");
  for (const group of INFO_SERVICES) {
    lines.push(`- ${group.title}: ${group.items.join(", ")}`);
  }

  const clients = [...SITE_CLIENTS].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
  lines.push("", "### Clients", "");
  for (const client of clients) lines.push(`- ${client}`);

  lines.push(
    "",
    "## Radio",
    "",
    `[Radio](${absoluteUrl("/radio")})`,
    "",
    `### ${RADIO_INTRO.title}`,
    "",
    RADIO_INTRO.description,
  );

  for (const episode of RADIO_EPISODES) {
    lines.push("", `### ${episode.title}`, "");
    lines.push(`- Listen: ${episode.mixcloudUrl}`);
    if (episode.durationLabel) lines.push(`- Runtime: ${episode.durationLabel}`);
    if (episode.description) lines.push("", episode.description);
    if (episode.tracklist.length > 0) {
      lines.push("", "Tracklist:", "");
      for (const track of episode.tracklist) {
        lines.push(`- ${track.artist} — ${track.title}`);
      }
    }
  }

  lines.push(
    "",
    "## Contact",
    "",
    `- Email: [${SITE_CONTACT_EMAIL}](${SITE_CONTACT_MAILTO})`,
    "- Based: New York and Los Angeles — International project capabilities",
    `- Instagram, Daniel Derro: [@danielderro_](${SITE_INSTAGRAM_DANIEL_DERRO})`,
    `- Instagram, No School Studio Records: [@noschoolstudiorecords](${SITE_INSTAGRAM_NO_SCHOOL_STUDIO_RECORDS})`,
    "",
  );

  return lines.join("\n");
}

/**
 * Project copy for the text routes. The Sanity client is imported lazily so a
 * missing project id or a CDN outage degrades to the static copy instead of
 * failing the route (and the build that prerenders it).
 */
export async function fetchLlmsProjects(): Promise<LlmsProject[]> {
  try {
    const [{ sanityFetchOrDefault }, { llmsProjectsQuery }] = await Promise.all([
      import("@/sanity/lib/fetch-safe"),
      import("@/sanity/lib/queries"),
    ]);
    return await sanityFetchOrDefault<LlmsProject[]>(llmsProjectsQuery, []);
  } catch (err) {
    console.error("[llms] project fetch failed:", err);
    return [];
  }
}

export const LLMS_CONTENT_TYPE = "text/markdown; charset=utf-8";
