"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  projectMediaItems,
  type ProjectMediaItem,
  type ProjectSlideImageSource,
} from "@/lib/project-media";
import { projectClientLabel, projectTagsLabel } from "@/lib/project-meta";
import { PROJECT_SLIDE_MAX_WIDTH, projectSlideImageUrl } from "@/sanity/lib/image";
import { pickDeviceSize } from "@/lib/image-device-sizes";
import SiteFooter from "@/components/SiteFooter";
import ProjectSlideImage from "@/components/ProjectSlideImage";
import SimpleVideoPlayer from "@/components/SimpleVideoPlayer";
import { useSlideDeck, useSlideDeckEnabled } from "@/lib/use-slide-deck";

type SanityImageField = ProjectSlideImageSource;

type GalleryImage = {
  _type: "imageAsset";
  _key: string;
  image: SanityImageField;
  caption?: string;
  alt?: string;
};

type GalleryVideo = {
  _type: "videoAsset";
  _key: string;
  videoUrl?: string;
  videoFileUrl?: string;
  thumbnail?: SanityImageField;
  caption?: string;
  title?: string;
};

type GalleryEntry = GalleryImage | GalleryVideo;

export type Project = {
  _id: string;
  title: string;
  slug: { current: string };
  client?: string;
  projectType: string;
  tags?: string[];
  coverImage?: SanityImageField;
  description?: string;
  date?: string;
  gallery?: GalleryEntry[];
};

const PROJECT_IMAGE_PAD_Y = 200;
const EAGER_SLIDE_COUNT = 4;
/** Slides warmed ahead of the active one. Paging is one slide per gesture. */
const PREFETCH_LOOKAHEAD = 4;

/**
 * The srcset candidate the browser will settle on for a 100vw slide, so the
 * prefetch warms that exact URL instead of fetching a second, unused size.
 */
function prefetchSlideWidth(): number {
  const needed = window.innerWidth * (window.devicePixelRatio || 1);
  return Math.min(pickDeviceSize(needed), PROJECT_SLIDE_MAX_WIDTH);
}

function ProjectSlideVideo({
  item,
}: {
  item: Extract<ProjectMediaItem, { kind: "video" }>;
}) {
  if (item.src) {
    const aspectRatio = item.aspectRatio ?? "16 / 9";
    return (
      <div
        className="project-video-frame"
        style={{ ["--project-video-ar" as string]: aspectRatio }}
      >
        <SimpleVideoPlayer src={item.src} aspectRatio={aspectRatio} />
      </div>
    );
  }

  if (item.poster) {
    return <ProjectSlideImage image={item.poster} alt={item.alt} eager />;
  }

  return null;
}

export default function ProjectPage({
  project,
  resolvedVideoSrcByKey = {},
}: {
  project: Project;
  /** Server-resolved Vimeo/direct URLs keyed by gallery `_key`. */
  resolvedVideoSrcByKey?: Record<string, string>;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  // Desktop: one-slide-per-gesture deck; touch keeps native CSS snap.
  useSlideDeck(scrollRef, useSlideDeckEnabled());
  const mediaItems: ProjectMediaItem[] = useMemo(
    () =>
      projectMediaItems(project).map((item) => {
        if (item.kind !== "video") return item;
        const resolved = resolvedVideoSrcByKey[item._key];
        return resolved ? { ...item, src: resolved } : item;
      }),
    [project, resolvedVideoSrcByKey],
  );
  const total = mediaItems.length;

  useEffect(() => {
    const root = scrollRef.current;
    if (!root || total === 0) return;

    const sections = root.querySelectorAll<HTMLElement>("[data-slide-index]");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.5) continue;
          if (!(entry.target instanceof HTMLElement)) continue;
          const idx = Number(entry.target.dataset.slideIndex);
          if (!Number.isNaN(idx)) setActiveIndex(idx);
        }
      },
      { root, threshold: [0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [total]);

  /** URLs already warmed, so re-running the effect never refetches a slide. */
  const prefetched = useRef(new Set<string>());

  // Warm a bounded run of slides ahead of the one being viewed. Prefetching
  // the whole deck costs several MB on a long project and most visitors never
  // reach the end; the window keeps paging instant without that bill.
  useEffect(() => {
    const last = Math.min(
      total - 1,
      Math.max(activeIndex + PREFETCH_LOOKAHEAD, EAGER_SLIDE_COUNT - 1),
    );
    if (last < EAGER_SLIDE_COUNT) return;

    const width = prefetchSlideWidth();
    const queue: string[] = [];
    for (let i = EAGER_SLIDE_COUNT; i <= last; i += 1) {
      const item = mediaItems[i];
      const source =
        item?.kind === "image"
          ? item.image
          : item?.kind === "video"
            ? item.poster
            : undefined;
      if (!source) continue;
      const url = projectSlideImageUrl(source, width);
      if (prefetched.current.has(url)) continue;
      prefetched.current.add(url);
      queue.push(url);
    }
    if (queue.length === 0) return;

    let cancelled = false;
    let cursor = 0;

    const prefetchOne = () => {
      if (cancelled || cursor >= queue.length) return;
      new window.Image().src = queue[cursor];
      cursor += 1;
      if (cursor < queue.length) scheduleNext();
    };

    const scheduleNext = () => {
      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(() => prefetchOne(), { timeout: 2000 });
      } else {
        window.setTimeout(prefetchOne, 16);
      }
    };

    scheduleNext();
    return () => {
      cancelled = true;
    };
  }, [mediaItems, total, activeIndex]);

  return (
    <main
      id="main-content"
      data-work-surface
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--color-black)",
        overflow: "hidden",
      }}
    >
      <h1 className="visually-hidden">{project.title}</h1>

      <div
        ref={scrollRef}
        className="project-scroll"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {mediaItems.map((item, index) => (
          <section
            key={item._key}
            data-slide-index={index}
            className="project-scroll-slide layout-full"
            style={{
              height: "100dvh",
              boxSizing: "border-box",
              paddingTop: PROJECT_IMAGE_PAD_Y,
              paddingBottom: PROJECT_IMAGE_PAD_Y,
            }}
          >
            {item.kind === "video" ? (
              <div className="project-slide-video">
                <ProjectSlideVideo item={item} />
              </div>
            ) : (
              <ProjectSlideImage
                image={item.image}
                alt={item.alt}
                priority={index === 0}
                eager={index < EAGER_SLIDE_COUNT}
              />
            )}
          </section>
        ))}
      </div>

      <SiteFooter
        client={projectClientLabel(project)}
        title={project.title}
        tags={projectTagsLabel(project)}
        slide={total > 0 ? { current: activeIndex + 1, total } : undefined}
      />
    </main>
  );
}
