"use client";

import { useEffect, useRef, useState } from "react";
import { formatSanityTag } from "@/lib/format-sanity-tag";
import {
  projectMediaItems,
  type ProjectMediaItem,
  type ProjectSlideImageSource,
} from "@/lib/project-media";
import { projectSlideImageUrl } from "@/sanity/lib/image";
import SiteFooter from "@/components/SiteFooter";
import ProjectSlideImage from "@/components/ProjectSlideImage";
import SimpleVideoPlayer from "@/components/SimpleVideoPlayer";

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

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function prefetchSlideWidth(): number {
  const margin = 24;
  return Math.min(Math.max(window.innerWidth - margin, 640), 1920);
}

function ProjectSlideVideo({
  item,
}: {
  item: Extract<ProjectMediaItem, { kind: "video" }>;
}) {
  if (item.src) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="project-video-frame">
          <SimpleVideoPlayer
            src={item.src}
            aspectRatio={item.aspectRatio ?? "16 / 9"}
          />
        </div>
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
  const mediaItems: ProjectMediaItem[] = projectMediaItems(project).map((item) => {
    if (item.kind !== "video") return item;
    const resolved = resolvedVideoSrcByKey[item._key];
    return resolved ? { ...item, src: resolved } : item;
  });
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

  // After first paint, prefetch remaining image slides at capped width without blocking eager slides.
  useEffect(() => {
    if (total <= EAGER_SLIDE_COUNT) return;

    const width = prefetchSlideWidth();
    let index = EAGER_SLIDE_COUNT;

    const prefetchOne = () => {
      if (index >= total) return;
      const item = mediaItems[index];
      if (item?.kind === "image") {
        const img = new window.Image();
        img.src = projectSlideImageUrl(item.image, width);
      } else if (item?.kind === "video" && item.poster) {
        const img = new window.Image();
        img.src = projectSlideImageUrl(item.poster, width);
      }
      index += 1;
      if (index < total) scheduleNext();
    };

    const scheduleNext = () => {
      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(() => prefetchOne(), { timeout: 2000 });
      } else {
        window.setTimeout(prefetchOne, 16);
      }
    };

    scheduleNext();
  }, [mediaItems, total]);

  const titleContent = (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "baseline",
        columnGap: 8,
        rowGap: 0,
      }}
    >
      <span className="text-body" style={{ color: "var(--color-black)" }}>
        {project.title}
      </span>
      {project.client ? (
        <span className="text-body" style={{ color: "var(--color-black)", opacity: 0.5 }}>
          {project.client}
        </span>
      ) : null}
    </div>
  );

  const tagsContent =
    project.tags && project.tags.length > 0 ? (
      <span className="text-small" style={{ color: "var(--color-primary)" }}>
        {project.tags.map(formatSanityTag).join(", ")}
      </span>
    ) : null;

  const slideCounter =
    total > 0 ? (
      <span
        className="text-small"
        style={{ display: "flex", gap: 4, fontVariantNumeric: "tabular-nums" }}
      >
        <span className="text-small" style={{ color: "var(--color-black)", opacity: 0.5 }}>
          {pad(activeIndex + 1)}
        </span>
        <span className="text-small" style={{ color: "var(--color-black)" }}>
          {pad(total)}
        </span>
      </span>
    ) : null;

  return (
    <div
      data-work-surface
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--color-black)",
        overflow: "hidden",
      }}
    >
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
              <ProjectSlideVideo item={item} />
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
        activePath="/work"
        leftContent={
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              rowGap: 4,
              minWidth: 0,
            }}
          >
            {titleContent}
          </div>
        }
        middleContent={tagsContent}
        rightContent={slideCounter}
      />
    </div>
  );
}
