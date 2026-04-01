"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { sanityImageUrl, sanityLoader } from "@/sanity/lib/image";
import { formatSanityTag } from "@/lib/format-sanity-tag";
import { MOTION } from "@/lib/motion";
import SiteFooter from "@/components/SiteFooter";

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

type Project = {
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

const NAV_ITEMS = [
  { label: "Info", href: "/info" },
  { label: "Return", href: "/work" },
  { label: "Exhibitions", href: "/exhibitions" },
  { label: "Radio", href: "/radio" },
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
  inset: 12,
};

export default function ProjectPage({ project }: { project: Project }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [navCursor, setNavCursor] = useState<{
    direction: "prev" | "next";
    x: number;
    y: number;
  } | null>(null);
  const mediaItems = galleryToMedia(project.gallery ?? []);
  const total = mediaItems.length;

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
      if (total === 0) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      setNavCursor({
        direction: x > rect.width / 2 ? "next" : "prev",
        x: e.clientX,
        y: e.clientY,
      });
    },
    [total],
  );

  const currentItem = mediaItems[activeIndex];

  const titleContent = (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "baseline",
        columnGap: 8,
        rowGap: 4,
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
          padding: 12,
          boxSizing: "border-box",
        }}
      >
        <header className="page-grid" style={{ alignItems: "center" }}>
          <div
            style={{
              gridColumn: "1 / 3",
              display: "flex",
              alignItems: "flex-end",
              gap: 12,
            }}
          >
            <Link
              href="/"
              className="text-body no-underline opacity-100 transition-opacity duration-600 ease-[cubic-bezier(0.76,0,0.24,1)] hover:opacity-80"
              style={{ color: "var(--color-black)" }}
            >
              Daniel Derro
            </Link>
          </div>

          <div
            style={{
              gridColumn: "3 / 5",
              display: "flex",
              alignItems: "flex-end",
              gap: 12,
            }}
          >
            <Link
              href="/"
              className="text-body no-underline opacity-100 transition-opacity duration-600 ease-[cubic-bezier(0.76,0,0.24,1)] hover:opacity-80"
              style={{ color: "var(--color-black)" }}
            >
              No-School Studio Records
            </Link>
          </div>

          <nav
            style={{
              gridColumn: "5 / 7",
              display: "flex",
              width: "100%",
              minWidth: 0,
              alignItems: "stretch",
              gap: 4,
            }}
          >
            {NAV_ITEMS.map((item) => {
              const isActive = item.label === "Return";
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`hover-smooth text-caption box-border flex min-w-0 flex-1 items-center justify-start border-[0.5px] px-1 py-0.5 no-underline ${
                    isActive
                      ? "border-transparent bg-(--color-black) text-(--color-white)"
                      : "border-(--color-stroke) text-(--color-black) hover:border-transparent hover:bg-(--color-black) hover:text-(--color-white)"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
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
          cursor: total === 0 || !navCursor ? "default" : "none",
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

      {navCursor && total > 0 ? (
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
        leftContent={titleContent}
        middleContent={tagsContent}
        rightContent={slideCounter}
      />
    </div>
  );
}
