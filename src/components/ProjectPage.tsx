"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { sanityImageUrl, sanityLoader } from "@/sanity/lib/image";
import { formatSanityTag } from "@/lib/format-sanity-tag";
import { MOTION } from "@/lib/motion";
import SiteFooter from "@/components/SiteFooter";
import SiteHeaderBand from "@/components/SiteHeaderBand";
import { MEDIA_DESKTOP_FINE_POINTER } from "@/lib/media-queries";
import { useMediaQuery } from "@/lib/use-media-query";
import type { SiteNavItem } from "@/lib/site-nav";

type SanityImageField = {
  asset: { _ref: string };
  hotspot?: { x: number; y: number };
};

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

type MediaItem = {
  _key: string;
  image: SanityImageField;
  alt: string;
};

const NAV_ITEMS: SiteNavItem[] = [
  { label: "Info", href: "/info" },
  { label: "Return", href: "/work" },
  { label: "Exhibitions", href: "/exhibitions", comingSoon: true },
  { label: "Radio", href: "/radio", comingSoon: true },
];

function galleryToMedia(gallery: GalleryEntry[]): MediaItem[] {
  const items: MediaItem[] = [];
  for (const entry of gallery) {
    if (entry._type === "imageAsset" && entry.image?.asset?._ref) {
      items.push({
        _key: entry._key,
        image: entry.image,
        alt: entry.alt?.trim() || entry.caption?.trim() || "",
      });
    } else if (entry._type === "videoAsset" && entry.thumbnail?.asset?._ref) {
      items.push({
        _key: entry._key,
        image: entry.thumbnail,
        alt: entry.caption?.trim() || entry.title?.trim() || "",
      });
    }
  }
  return items;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function NavCursorGlyph({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      {direction === "prev" ? (
        <path
          d="M15 18l-6-6 6-6"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M9 18l6-6-6-6"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

const slideTransition = {
  duration: MOTION.duration.gallerySlide,
  ease: MOTION.ease.heavy,
} as const;

const slideFrameStyle = {
  position: "absolute" as const,
  inset: "var(--spacing-margin)",
};

export default function ProjectPage({ project }: { project: Project }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [navCursor, setNavCursor] = useState<{
    direction: "prev" | "next";
    x: number;
    y: number;
  } | null>(null);
  const showSlideshowCursorArrows = useMediaQuery(MEDIA_DESKTOP_FINE_POINTER);
  const mediaItems = galleryToMedia(project.gallery ?? []);
  const total = mediaItems.length;

  useEffect(() => {
    if (!showSlideshowCursorArrows) setNavCursor(null);
  }, [showSlideshowCursorArrows]);

  const endSlideTransition = useCallback(() => {
    setPrevIndex(null);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (total === 0) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const isRight = x > rect.width / 2;

      setActiveIndex((prev) => {
        const next = isRight ? (prev + 1) % total : (prev - 1 + total) % total;
        if (next === prev) return prev;
        setPrevIndex(prev);
        return next;
      });
    },
    [total],
  );

  const updateNavCursor = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (total === 0 || !showSlideshowCursorArrows) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      setNavCursor({
        direction: x > rect.width / 2 ? "next" : "prev",
        x: e.clientX,
        y: e.clientY,
      });
    },
    [total, showSlideshowCursorArrows],
  );

  const currentItem = mediaItems[activeIndex];

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

  const projectFooterLeft = (
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
  );

  const slideCounter = total > 0 ? (
    <span className="text-caption" style={{ display: "flex", gap: 4 }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={activeIndex}
          className="text-caption"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: MOTION.duration.gallerySlide,
            ease: MOTION.ease.heavy,
          }}
          style={{ color: "var(--color-black)" }}
        >
          {pad(activeIndex + 1)}
        </motion.span>
      </AnimatePresence>
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
      {/* ── Fixed header ──────────────────────────────────── */}
      <div
        className="blend-overlay"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "var(--spacing-margin)",
          boxSizing: "border-box",
        }}
      >
        <SiteHeaderBand
          navItems={NAV_ITEMS}
          variant="light"
          isActive={(item) => item.label === "Return"}
        />
      </div>

      {/* ── Full-height slideshow ─────────────────────────── */}
      <div
        onClick={handleClick}
        onMouseEnter={updateNavCursor}
        onMouseMove={updateNavCursor}
        onMouseLeave={() => setNavCursor(null)}
        style={{
          position: "absolute",
          inset: 0,
          cursor:
            total === 0 || !navCursor || !showSlideshowCursorArrows
              ? "default"
              : "none",
          zIndex: 1,
        }}
      >
        {prevIndex !== null && prevIndex !== activeIndex ? (
          <>
            <motion.div
              key={`out-${prevIndex}-${activeIndex}`}
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={slideTransition}
              style={{ ...slideFrameStyle, zIndex: 1 }}
            >
              <Image
                loader={sanityLoader}
                src={sanityImageUrl(mediaItems[prevIndex].image)}
                alt={mediaItems[prevIndex].alt}
                fill
                sizes="100vw"
                quality={90}
                style={{ objectFit: "contain" }}
              />
            </motion.div>
            <motion.div
              key={`in-${activeIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={slideTransition}
              style={{ ...slideFrameStyle, zIndex: 2 }}
              onAnimationComplete={endSlideTransition}
            >
              <Image
                loader={sanityLoader}
                src={sanityImageUrl(mediaItems[activeIndex].image)}
                alt={mediaItems[activeIndex].alt}
                fill
                sizes="100vw"
                quality={90}
                style={{ objectFit: "contain" }}
                priority
              />
            </motion.div>
          </>
        ) : currentItem ? (
          <div style={slideFrameStyle}>
            <Image
              loader={sanityLoader}
              src={sanityImageUrl(currentItem.image)}
              alt={currentItem.alt}
              fill
              sizes="100vw"
              quality={90}
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
        ) : null}
      </div>

      {showSlideshowCursorArrows && navCursor && total > 0 ? (
        <div
          aria-hidden
          style={{
            position: "fixed",
            left: navCursor.x,
            top: navCursor.y,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 99,
            mixBlendMode: "exclusion",
          }}
        >
          <NavCursorGlyph direction={navCursor.direction} />
        </div>
      ) : null}

      {/* ── Footer with project info ─────────────────────── */}
      <SiteFooter
        activePath="/work"
        leftContent={projectFooterLeft}
        middleContent={tagsContent}
        rightContent={slideCounter}
      />
    </div>
  );
}
