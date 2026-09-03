"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  sanityImageBlurUrl,
  sanityImageUrl,
  workThumbImageUrl,
} from "@/sanity/lib/image";
import SitePageFooter from "@/components/SitePageFooter";
import { mediaEnterTransition, MOTION } from "@/lib/motion";
import { useDismissOnScroll } from "@/lib/use-dismiss-on-scroll";
import { markUnmutedAutoplay } from "@/lib/autoplay-sound";
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
const HOVER_HOLD_MS = 450;

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

function byUploadedAt(a: WorkProject, b: WorkProject): number {
  const left = a._createdAt ?? "";
  const right = b._createdAt ?? "";
  if (left && right) return right.localeCompare(left);
  if (left) return -1;
  if (right) return 1;
  return 0;
}

/** Stable scramble — same order on every refresh; new IDs slot in without reshuffling. */
function scrambleKey(id: string): number {
  let hash = 2166136261;
  for (let i = 0; i < id.length; i += 1) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function byStableScramble(a: WorkProject, b: WorkProject): number {
  const left = scrambleKey(a._id);
  const right = scrambleKey(b._id);
  if (left !== right) return left - right;
  return a._id.localeCompare(b._id);
}

/** Editorial pins for All. Everything else keeps the stable scramble. */
const ALL_PIN_FRONT = [
  "sideshow-hardtokill",
  "systemarosa-for-t-magazine",
  "hidden-ny-x-asics",
  "committed-escape-introduction-to-lid",
  "stussy-x-our-legacy",
] as const;

const ALL_PIN_BACK = ["hailee-bieber-x-ysl"] as const;

function sortAll(projects: WorkProject[]): WorkProject[] {
  const bySlug = new Map(
    projects.map((project) => [project.slug.current, project]),
  );
  const used = new Set<string>();
  const take = (slugs: readonly string[]): WorkProject[] => {
    const out: WorkProject[] = [];
    for (const slug of slugs) {
      const project = bySlug.get(slug);
      if (!project) continue;
      out.push(project);
      used.add(slug);
    }
    return out;
  };

  const front = take(ALL_PIN_FRONT);
  const pinBack = new Set<string>(ALL_PIN_BACK);
  const middle = projects
    .filter(
      (project) =>
        !used.has(project.slug.current) && !pinBack.has(project.slug.current),
    )
    .sort(byStableScramble);

  return [...front, ...middle, ...take(ALL_PIN_BACK)];
}

function sortForFilter(
  projects: WorkProject[],
  filter: WorkFilterId,
): WorkProject[] {
  const next = [...projects];
  if (filter === "a-z") return next.sort(byTitle);
  if (filter === "all") return sortAll(next);
  return next.sort(byUploadedAt);
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
  lqip?: string;
};

type ExternalCover = {
  src: string;
  width: number;
  height: number;
};

export type WorkProject = {
  _id: string;
  /** Sanity upload stamp — drives Stills / Motion / No School ordering. */
  _createdAt?: string;
  title: string;
  slug: { current: string };
  client?: string;
  projectType: string;
  tags?: string[];
  date?: string;
  coverImage?: SanityImageField;
  galleryThumbs?: { image?: SanityImageField }[];
  /** Direct CDN URL for the project's first uploaded video file, if any. */
  coverVideoUrl?: string | null;
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
  blurSrc?: string;
};

function blurSrcFor(image: SanityImageField): string | undefined {
  if (image.lqip) return image.lqip;
  if (image.asset?._ref) return sanityImageBlurUrl(image);
  return undefined;
}

function thumbFullSrc(thumb: StripThumb): string {
  if (thumb.remote) return thumb.src;
  return workThumbImageUrl(thumb.src, thumb.aspect);
}

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
    blurSrc: blurSrcFor(image),
  }));
}

/** Phones / tablets: keep the page as the only vertical scroller. */
const MOBILE_STRIP_PAN = "(hover: none), (max-width: 767px)";

/** Drive strip.scrollLeft from touch so overflow-x can stay hidden on mobile. */
function bindMobileStripPan(el: HTMLElement): () => void {
  const syncOverflow = () => {
    el.dataset.overflow = el.scrollWidth > el.clientWidth + 1 ? "x" : "none";
  };
  syncOverflow();
  const ro = new ResizeObserver(syncOverflow);
  ro.observe(el);

  let startX = 0;
  let startY = 0;
  let startScroll = 0;
  let axis: "x" | "y" | null = null;

  const onStart = (event: TouchEvent) => {
    if (el.dataset.overflow !== "x") return;
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
    startScroll = el.scrollLeft;
    axis = null;
  };

  const onMove = (event: TouchEvent) => {
    if (el.dataset.overflow !== "x" || event.touches.length !== 1) return;
    const dx = event.touches[0].clientX - startX;
    const dy = event.touches[0].clientY - startY;
    if (!axis) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (axis !== "x") return;
    el.scrollLeft = startScroll - dx;
  };

  const onEnd = () => {
    axis = null;
  };

  el.addEventListener("touchstart", onStart, { passive: true });
  el.addEventListener("touchmove", onMove, { passive: true });
  el.addEventListener("touchend", onEnd, { passive: true });
  el.addEventListener("touchcancel", onEnd, { passive: true });

  return () => {
    ro.disconnect();
    el.removeEventListener("touchstart", onStart);
    el.removeEventListener("touchmove", onMove);
    el.removeEventListener("touchend", onEnd);
    el.removeEventListener("touchcancel", onEnd);
    delete el.dataset.overflow;
  };
}

function armWorkThumb(el: HTMLElement, blurSrc?: string) {
  if (el.dataset.armed === "true") return;
  el.dataset.armed = "true";

  const media = el.querySelector<HTMLElement>(".work-thumb-media");
  if (media && blurSrc) {
    media.style.setProperty("--work-blur", `url("${blurSrc}")`);
  }

  const img = el.querySelector<HTMLImageElement>("img.work-thumb-full");
  if (!img?.dataset.src) return;

  const reveal = () => {
    el.dataset.loaded = "true";
  };
  img.addEventListener("load", reveal, { once: true });
  img.addEventListener("error", reveal, { once: true });
  img.src = img.dataset.src;
  if (img.complete && img.naturalWidth > 0) reveal();
}

function ThumbnailStrip({
  thumbs,
  eager,
}: {
  thumbs: StripThumb[];
  eager?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const nodes = [
      ...root.querySelectorAll<HTMLElement>(".work-row-strip-thumb"),
    ];
    if (eager) {
      nodes.forEach((node, i) => armWorkThumb(node, thumbs[i]?.blurSrc));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const node = entry.target as HTMLElement;
          const i = nodes.indexOf(node);
          armWorkThumb(node, thumbs[i]?.blurSrc);
          io.unobserve(node);
        }
      },
      { rootMargin: "400px 160px", threshold: 0.01 },
    );
    nodes.forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, [thumbs, eager]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const mq = window.matchMedia(MOBILE_STRIP_PAN);
    let unbind: (() => void) | undefined;

    const apply = () => {
      unbind?.();
      unbind = undefined;
      if (mq.matches) unbind = bindMobileStripPan(el);
      else delete el.dataset.overflow;
    };

    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      unbind?.();
    };
  }, [thumbs]);

  if (thumbs.length === 0) return null;

  return (
    <div ref={rootRef} className="work-row-strip">
      <div className="work-row-strip-inner">
        {thumbs.map((thumb) => (
          <div
            key={thumb.key}
            className="work-row-strip-thumb"
            style={{ aspectRatio: thumb.aspect }}
          >
            <span className="work-thumb-media">
              {/* eslint-disable-next-line @next/next/no-img-element -- src is armed when the thumb nears the viewport */}
              <img
                className="work-thumb-full"
                alt=""
                data-src={thumbFullSrc(thumb)}
                decoding="async"
                draggable={false}
              />
            </span>
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
  const thumbs = useMemo(() => getStripThumbs(project), [project]);

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
        onPointerDown={markUnmutedAutoplay}
        onFocus={() => onFocusHover(project._id)}
        onBlur={() => onFocusHover(null)}
      >
        <ThumbnailStrip thumbs={thumbs} eager={index < 2} />

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

  const visibleProjects = sortForFilter(
    projects.filter((project) => matchesFilter(project, filter)),
    filter,
  );

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
          <AnimatePresence>
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
