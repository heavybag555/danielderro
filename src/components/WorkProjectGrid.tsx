"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { sanityImageUrl, sanityLoader } from "@/sanity/lib/image";
import SitePageFooter from "@/components/SitePageFooter";
import { mediaEnterTransition, MOTION } from "@/lib/motion";
import { useDismissOnScroll } from "@/lib/use-dismiss-on-scroll";
import {
  getThumbAspect,
  THUMB_FALLBACK_ASPECT,
} from "@/lib/work-strip-fit";
import {
  useWorkFilter,
  WORK_FILTERS,
  type WorkFilterId,
} from "@/lib/work-filters";

/** Standing headline; swaps to the hovered project title. */
const WORK_HEADING = "Work";

/** Pointer must stay on a row this long before dim / title swap fire. */
const HOVER_HOLD_MS = 150;

function matchesFilter(project: WorkProject, filter: WorkFilterId): boolean {
  switch (filter) {
    case "all":
    case "a-z":
      return true;
    case "stills":
      return project.projectType === "photography";
    case "motion":
      return project.projectType === "video";
    case "no-school":
      return project.tags?.includes("no-school-studio") ?? false;
  }
}

function byTitle(a: WorkProject, b: WorkProject): number {
  return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
}

/** Crossfade on filter change: outgoing list dissolves while the incoming list
   cascades in over the same cell. No wait-gap — that emptied the page. */
const LIST_VARIANTS: Variants = {
  hidden: {},
  show: {},
  exit: {
    opacity: 0,
    pointerEvents: "none",
    transition: { duration: 0.32, ease: MOTION.ease.heavy },
  },
};

const ROW_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  show: (index: number) => ({
    opacity: 1,
    transition: mediaEnterTransition(index),
  }),
};

type SanityImageField = {
  asset: { _ref: string };
  hotspot?: { x: number; y: number };
};

type ExternalCover = {
  src: string;
  width: number;
  height: number;
};

export type WorkProject = {
  _id: string;
  /** Sanity upload stamp — drives the default (non A-Z) ordering. */
  _createdAt?: string;
  title: string;
  slug: { current: string };
  client?: string;
  projectType: string;
  tags?: string[];
  date?: string;
  coverImage?: SanityImageField;
  galleryThumbs?: { image?: SanityImageField }[];
  /** Vimeo / remote stills for No School catalog rows (no Sanity asset). */
  externalCover?: ExternalCover;
};

/** Most thumbnails in a strip; denser rows scale down until they fill the row width. */
const THUMB_MAX = 24;

/** Cover image first, then gallery thumbnails — deduped by asset ref. */
function getStripImages(project: WorkProject): SanityImageField[] {
  const raw: (SanityImageField | undefined)[] = [
    project.coverImage,
    ...(project.galleryThumbs ?? []).map((g) => g?.image),
  ];
  const seen = new Set<string>();
  const out: SanityImageField[] = [];
  for (const img of raw) {
    const ref = img?.asset?._ref;
    if (!ref || seen.has(ref)) continue;
    seen.add(ref);
    out.push(img);
  }
  return out.slice(0, THUMB_MAX);
}

const TAG_LABELS: Record<string, string> = {
  editorial: "Editorial",
  campaign: "Campaign",
};

function typeLabel(projectType: string): string {
  if (projectType === "photography") return "Stills";
  if (projectType === "video") return "Motion";
  if (!projectType) return "";
  return projectType.charAt(0).toUpperCase() + projectType.slice(1);
}

/** Left caption column: the commissioning client, or the body of work it belongs to. */
function clientLabel(project: WorkProject): string {
  const client = project.client?.trim();
  if (client) return client;
  if (project.tags?.includes("no-school-studio")) return "No School Studio";
  return "Personal";
}

/** Right caption column: tag labels then medium, comma separated. */
function categoryLabel(project: WorkProject): string {
  const labels: string[] = [];
  for (const tag of project.tags ?? []) {
    const label = TAG_LABELS[tag];
    if (label) labels.push(label);
  }
  const medium = typeLabel(project.projectType);
  if (medium) labels.push(medium);
  return labels.join(", ");
}

function yearLabel(project: WorkProject): string {
  return project.date?.slice(0, 4) ?? "";
}

type StripThumb = {
  key: string;
  src: string;
  aspect: number;
  remote: boolean;
};

function getStripThumbs(project: WorkProject): StripThumb[] {
  const cover = project.externalCover;
  if (cover) {
    return [
      {
        key: cover.src,
        src: cover.src,
        aspect:
          cover.width && cover.height
            ? cover.width / cover.height
            : THUMB_FALLBACK_ASPECT,
        remote: true,
      },
    ];
  }

  return getStripImages(project).map((image, index) => ({
    key: image.asset._ref ?? String(index),
    src: sanityImageUrl(image),
    aspect: getThumbAspect(image),
    remote: false,
  }));
}

function ThumbnailStrip({ thumbs }: { thumbs: StripThumb[] }) {
  if (thumbs.length === 0) return null;

  return (
    <div className="work-row-strip">
      <div className="work-row-strip-inner">
        {thumbs.map((thumb) => (
          <div
            key={thumb.key}
            className="work-row-strip-thumb"
            style={{ aspectRatio: thumb.aspect }}
          >
            <Image
              {...(thumb.remote ? {} : { loader: sanityLoader })}
              src={thumb.src}
              alt=""
              fill
              sizes={`${Math.round(160 * thumb.aspect)}px`}
              quality={90}
              style={{ objectFit: "cover" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkHeaderFilters() {
  const [filter, setFilter] = useWorkFilter();

  return (
    <nav className="work-header-filters text-small" aria-label="Filter projects">
      {WORK_FILTERS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={
            filter === item.id
              ? "work-header-filters-btn is-active hover-smooth"
              : "work-header-filters-btn hover-smooth"
          }
          aria-pressed={filter === item.id}
          onClick={() => setFilter(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

function ProjectRow({
  project,
  hovered,
  onPointerHover,
  onFocusHover,
  variants,
  index,
}: {
  project: WorkProject;
  hovered: boolean;
  onPointerHover: (id: string | null) => void;
  onFocusHover: (id: string | null) => void;
  variants?: Variants;
  index: number;
}) {
  const thumbs = getStripThumbs(project);

  return (
    <motion.li
      custom={index}
      variants={variants}
      className="work-row"
      data-hovered={hovered}
      style={{ listStyle: "none" }}
      onPointerEnter={() => onPointerHover(project._id)}
      onPointerLeave={() => onPointerHover(null)}
    >
      <Link
        href={`/work/${project.slug.current}`}
        aria-label={project.title}
        className="work-row-link"
        onFocus={() => onFocusHover(project._id)}
        onBlur={() => onFocusHover(null)}
      >
        <ThumbnailStrip thumbs={thumbs} />

        <div className="work-row-caption layout-grid text-caption">
          <span className="work-row-caption-client work-row-caption-muted">
            {clientLabel(project)}
          </span>
          <span className="work-row-caption-title">{project.title}</span>
          <span className="work-row-caption-category work-row-caption-muted">
            {categoryLabel(project)}
          </span>
          <span className="work-row-caption-year work-row-caption-muted">
            {yearLabel(project)}
          </span>
        </div>
      </Link>
    </motion.li>
  );
}

export default function WorkProjectGrid({
  projects,
}: {
  projects: WorkProject[];
}) {
  const reduceMotion = useReducedMotion();
  const stagger = !reduceMotion;
  const [filter] = useWorkFilter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hoverTimer = useRef<number | null>(null);

  const clearHoverTimer = () => {
    if (hoverTimer.current !== null) {
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  const commitHover = (id: string | null) => {
    clearHoverTimer();
    setHoveredId(id);
  };

  const requestHover = (id: string | null) => {
    clearHoverTimer();
    if (id === null) {
      setHoveredId(null);
      return;
    }
    hoverTimer.current = window.setTimeout(() => {
      setHoveredId(id);
      hoverTimer.current = null;
    }, HOVER_HOLD_MS);
  };

  const filtered = projects.filter((project) => matchesFilter(project, filter));
  const visibleProjects =
    filter === "a-z" ? [...filtered].sort(byTitle) : filtered;

  const hoveredTitle =
    visibleProjects.find((project) => project._id === hoveredId)?.title ?? null;
  /** Held through the fade-out so the headline never blanks mid-transition. */
  const [lastHoveredTitle, setLastHoveredTitle] = useState("");

  useEffect(() => {
    if (hoveredTitle) setLastHoveredTitle(hoveredTitle);
  }, [hoveredTitle]);

  useEffect(() => {
    clearHoverTimer();
    setHoveredId(null);
  }, [filter]);

  useDismissOnScroll(() => {
    clearHoverTimer();
    setHoveredId(null);
  });

  useEffect(() => clearHoverTimer, []);

  return (
    <main
      id="main-content"
      style={{ minHeight: "100dvh", background: "var(--color-black)" }}
    >
      <header className="work-page-header layout-full">
        <div className="work-header-bar layout-grid">
          <div className="work-heading">
            <h1 className="text-heading work-heading-line" data-on={!hoveredTitle}>
              {WORK_HEADING}
            </h1>
            <span
              aria-hidden="true"
              className="text-heading work-heading-line"
              data-on={Boolean(hoveredTitle)}
            >
              {lastHoveredTitle}
            </span>
          </div>
          <WorkHeaderFilters />
        </div>
      </header>

      <div className="layout-full work-page-content site-page-bottom-padding">
        <p className="visually-hidden" aria-live="polite">
          {`${visibleProjects.length} projects, ${
            WORK_FILTERS.find((item) => item.id === filter)?.label ?? "All"
          }`}
        </p>

        <div className="work-list-swap">
          <AnimatePresence initial={false}>
            <motion.ol
              key={filter}
              className="work-project-list"
              data-hovering={Boolean(hoveredTitle)}
              variants={stagger ? LIST_VARIANTS : undefined}
              initial={stagger ? "hidden" : false}
              animate={stagger ? "show" : undefined}
              exit={stagger ? "exit" : undefined}
              style={{ zIndex: 1 }}
            >
              {visibleProjects.map((project, index) => (
                <ProjectRow
                  key={project._id}
                  project={project}
                  hovered={project._id === hoveredId}
                  onPointerHover={requestHover}
                  onFocusHover={commitHover}
                  variants={stagger ? ROW_VARIANTS : undefined}
                  index={index}
                />
              ))}
            </motion.ol>
          </AnimatePresence>
        </div>

        <SitePageFooter />
      </div>
    </main>
  );
}
