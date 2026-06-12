"use client";

import { useEffect, useRef, useState } from "react";
import { formatSanityTag } from "@/lib/format-sanity-tag";
import { projectMediaItems, type ProjectMediaItem, type ProjectSlideImageSource } from "@/lib/project-media";
import { projectSlideImageUrl } from "@/sanity/lib/image";
import SiteFooter from "@/components/SiteFooter";
import ProjectSlideImage from "@/components/ProjectSlideImage";

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

export default function ProjectPage({ project }: { project: Project }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const mediaItems: ProjectMediaItem[] = projectMediaItems(project);
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

  // After first paint, prefetch remaining slides at capped width without blocking eager slides.
  useEffect(() => {
    if (total <= EAGER_SLIDE_COUNT) return;

    const width = prefetchSlideWidth();
    let index = EAGER_SLIDE_COUNT;

    const prefetchOne = () => {
      if (index >= total) return;
      const item = mediaItems[index];
      const img = new window.Image();
      img.src = projectSlideImageUrl(item.image, width);
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
      <span className="text-caption" style={{ color: "var(--color-primary)" }}>
        {project.tags.map(formatSanityTag).join(", ")}
      </span>
    ) : null;

  const slideCounter =
    total > 0 ? (
      <span
        className="text-caption"
        style={{ display: "flex", gap: 4, fontVariantNumeric: "tabular-nums" }}
      >
        <span className="text-caption" style={{ color: "var(--color-black)", opacity: 0.5 }}>
          {pad(activeIndex + 1)}
        </span>
        <span className="text-caption" style={{ color: "var(--color-black)" }}>
          {pad(total)}
        </span>
      </span>
    ) : null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--color-white)",
        overflow: "hidden",
      }}
    >
      <div
        ref={scrollRef}
        data-lenis-prevent
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
            className="project-scroll-slide"
            style={{
              height: "100dvh",
              boxSizing: "border-box",
              paddingTop: PROJECT_IMAGE_PAD_Y,
              paddingBottom: PROJECT_IMAGE_PAD_Y,
              paddingLeft: "var(--spacing-margin)",
              paddingRight: "var(--spacing-margin)",
            }}
          >
            <ProjectSlideImage
              image={item.image}
              alt={item.alt}
              priority={index === 0}
              eager={index < EAGER_SLIDE_COUNT}
            />
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
