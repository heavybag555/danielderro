"use client";

import { useState, useCallback } from "react";
import type { MotionValue } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { sanityImageUrl, sanityLoader } from "@/sanity/lib/image";
import { formatSanityTag } from "@/lib/format-sanity-tag";
import { MOTION } from "@/lib/motion";
import SiteBrandStrip from "@/components/SiteBrandStrip";
import { useMediaQuery } from "@/lib/use-media-query";

type SanityImageField = {
  asset: { _ref: string };
  hotspot?: { x: number; y: number };
};

export type WorkProject = {
  _id: string;
  title: string;
  slug: { current: string };
  client?: string;
  projectType: string;
  tags?: string[];
  coverImage?: SanityImageField;
  fallbackImage?: SanityImageField;
};

type FilterKey = "photo" | "motion" | "nss";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "photo", label: "Photo" },
  { key: "motion", label: "Motion" },
  { key: "nss", label: "No-School Studio Records" },
];

/** Vertical inset for project text inside the scroll region (below header / above footer). */
const WORK_PROJECT_TEXT_PAD_Y = 120;

function getProjectImage(
  project: WorkProject,
): SanityImageField | undefined {
  return project.coverImage ?? project.fallbackImage;
}

/** Parse intrinsic dimensions from a Sanity image asset `_ref`, e.g. `image-<hash>-1920x1080-jpg`. */
function getSanityImageDims(
  image: SanityImageField,
): { width: number; height: number } | null {
  const match = image.asset?._ref?.match(/-(\d+)x(\d+)-[a-z0-9]+$/i);
  if (!match) return null;
  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!width || !height) return null;
  return { width, height };
}

/** Fixed width of the cursor-following preview overlay on `/work`. */
const HOVER_PREVIEW_WIDTH = 200;
/** Fallback aspect ratio (height / width) if we can't parse dims from the asset ref. */
const HOVER_PREVIEW_FALLBACK_ASPECT = 4 / 3;
/** Gap between the cursor and the overlay's bottom-left corner (px, both axes). */
const HOVER_PREVIEW_CURSOR_GAP = 16;
/** Fade-in/out duration for the cursor-following preview overlay (seconds). */
const HOVER_PREVIEW_FADE_DURATION = 0.18;
/** Extra safety margin (px) used when deciding whether to flip the overlay near a viewport edge. */
const HOVER_PREVIEW_EDGE_SAFE = 8;

/**
 * Single preview image in the cursor-following overlay stack. Each instance stays mounted
 * while the filter is active (so rapid hover scrubbing never re-loads images) and derives its
 * own transform from the shared pointer motion values. Extracted as a component so its hooks
 * don't live inside a `.map()` loop.
 */
function HoverPreview({
  project,
  pointerX,
  pointerY,
  isActive,
}: {
  project: WorkProject;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  isActive: boolean;
}) {
  const img = getProjectImage(project);
  const dims = img ? getSanityImageDims(img) : null;
  const aspect = dims
    ? dims.height / dims.width
    : HOVER_PREVIEW_FALLBACK_ASPECT;
  const previewHeight = Math.round(HOVER_PREVIEW_WIDTH * aspect);

  // X position: prefer to the right of the cursor; flip to the left if that would overflow the viewport.
  const translateX = useTransform(pointerX, (px) => {
    if (typeof window === "undefined") return px + HOVER_PREVIEW_CURSOR_GAP;
    const vw = window.innerWidth;
    const wouldOverflowRight =
      px + HOVER_PREVIEW_CURSOR_GAP + HOVER_PREVIEW_WIDTH >
      vw - HOVER_PREVIEW_EDGE_SAFE;
    return wouldOverflowRight
      ? px - HOVER_PREVIEW_CURSOR_GAP - HOVER_PREVIEW_WIDTH
      : px + HOVER_PREVIEW_CURSOR_GAP;
  });

  // Y position: prefer above the cursor; flip below if that would overflow the top of the viewport.
  const translateY = useTransform(pointerY, (py) => {
    if (typeof window === "undefined")
      return py - HOVER_PREVIEW_CURSOR_GAP - previewHeight;
    const wouldOverflowTop =
      py - HOVER_PREVIEW_CURSOR_GAP - previewHeight < HOVER_PREVIEW_EDGE_SAFE;
    return wouldOverflowTop
      ? py + HOVER_PREVIEW_CURSOR_GAP
      : py - HOVER_PREVIEW_CURSOR_GAP - previewHeight;
  });

  if (!img) return null;

  return (
    <motion.div
      initial={false}
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={{
        duration: HOVER_PREVIEW_FADE_DURATION,
        ease: MOTION.ease.out,
      }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        x: translateX,
        y: translateY,
        width: HOVER_PREVIEW_WIDTH,
        height: previewHeight,
        willChange: "opacity, transform",
      }}
    >
      <Image
        loader={sanityLoader}
        src={sanityImageUrl(img)}
        alt=""
        fill
        sizes={`${HOVER_PREVIEW_WIDTH}px`}
        quality={85}
        style={{ objectFit: "contain" }}
      />
    </motion.div>
  );
}

function matchesFilter(
  project: WorkProject,
  filter: FilterKey | null,
): boolean {
  if (!filter) return true;
  if (filter === "photo") return project.projectType === "photography";
  if (filter === "motion") return project.projectType === "video";
  if (filter === "nss")
    return project.tags?.includes("no-school-studio") ?? false;
  return true;
}

export default function WorkProjectGrid({
  projects,
}: {
  projects: WorkProject[];
}) {
  const [activeFilter, setActiveFilter] = useState<FilterKey | null>("photo");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(0);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [tagBarHovered, setTagBarHovered] = useState(false);
  const [filterHoverKey, setFilterHoverKey] = useState<FilterKey | null>(null);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const filtered = projects.filter((p) => matchesFilter(p, activeFilter));

  const isLg = useMediaQuery("(min-width: 1024px)");
  const isMd = useMediaQuery("(min-width: 768px)");
  const isMobile = !isMd;
  /** Tablet: 4-col grid, first column empty, three projects per row; desktop: 6-col checkerboard; mobile: one column only */
  const isTablet = isMd && !isLg;
  const chunkSize = isLg ? 4 : isTablet ? 3 : 1;

  const rows: WorkProject[][] = [];
  for (let i = 0; i < filtered.length; i += chunkSize) {
    rows.push(filtered.slice(i, i + chunkSize));
  }

  const toggleFilter = useCallback((key: FilterKey) => {
    setActiveFilter((prev) => (prev === key ? null : key));
    setHoveredIndex(0);
  }, []);

  const workFooterFilterColumn = (
    <div
      style={{ display: "flex", flexDirection: "column" }}
      onMouseEnter={() => setTagBarHovered(true)}
      onMouseLeave={() => {
        setTagBarHovered(false);
        setFilterHoverKey(null);
      }}
    >
      {FILTERS.map((f) => {
        const selectionActive =
          activeFilter === null || activeFilter === f.key;
        const inHoverEmphasis =
          tagBarHovered &&
          filterHoverKey !== null &&
          f.key === filterHoverKey;
        const inHoverDim =
          tagBarHovered &&
          filterHoverKey !== null &&
          f.key !== filterHoverKey;
        const color = inHoverEmphasis
          ? "rgba(255, 255, 255, 1)"
          : inHoverDim
            ? "rgba(255, 255, 255, 0.5)"
            : selectionActive
              ? "rgba(255, 255, 255, 1)"
              : "rgba(255, 255, 255, 0.5)";

        return (
          <motion.button
            key={f.key}
            type="button"
            onClick={() => toggleFilter(f.key)}
            onMouseEnter={() => setFilterHoverKey(f.key)}
            className="text-body"
            animate={{ color }}
            transition={{
              duration: MOTION.duration.hover,
              ease: MOTION.ease.heavy,
            }}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            {f.label}
          </motion.button>
        );
      })}
    </div>
  );

  const workFooterVenice = (
    <span
      className="text-caption"
      style={{ color: "var(--color-primary)" }}
    >
      Venice, California
    </span>
  );

  return (
    <div
      style={{
        position: "relative",
        height: "100dvh",
        minHeight: "100dvh",
        overflow: "hidden",
        background: "#000000",
      }}
    >
      {/* Cursor-following preview overlay — all preview images stay mounted and crossfade
          via opacity so rapid project-to-project hovering stays smooth. Each preview reads
          the shared pointer motion values and flips its position toward the opposite edge
          when the default placement (top-right of cursor) would overflow the viewport. */}
      {!isMobile ? (
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 5,
            pointerEvents: "none",
          }}
        >
          {filtered.map((project, idx) => (
            <HoverPreview
              key={project._id}
              project={project}
              pointerX={pointerX}
              pointerY={pointerY}
              isActive={previewVisible && idx === hoveredIndex}
            />
          ))}
        </div>
      ) : null}

      {/* Fixed header — same Daniel Derro / Menu band as other pages.
          `SiteBrandStrip` uses `blend-overlay` so its black text inverts to
          white over the black work background automatically. */}
      <SiteBrandStrip />

      {/* Content layer */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          padding: isMobile
            ? "0 var(--spacing-margin) 0"
            : "0 var(--spacing-margin) var(--spacing-margin)",
          boxSizing: "border-box",
          gap: 10,
        }}
      >
        {/* ── Project rows: centered on md+; top-aligned on mobile so initial scroll isn’t mid-list ── */}
        <div
          data-lenis-prevent
          onMouseMove={
            isMobile
              ? undefined
              : (e) => {
                  pointerX.set(e.clientX);
                  pointerY.set(e.clientY);
                }
          }
          onMouseLeave={
            isMobile ? undefined : () => setPreviewVisible(false)
          }
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: isMobile ? "flex-start" : "center",
            gap: isMobile ? 48 : 120,
            overflowY: "auto",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
            paddingTop: `calc(var(--site-fixed-brand-strip-height) + 10px + ${WORK_PROJECT_TEXT_PAD_Y}px)`,
            paddingBottom: isMobile
              ? `calc(${WORK_PROJECT_TEXT_PAD_Y}px + 168px + env(safe-area-inset-bottom, 0px))`
              : WORK_PROJECT_TEXT_PAD_Y,
          }}
        >
          {rows.map((row, rowIdx) => (
            <div
              key={rowIdx}
              className="page-grid work-project-grid-row items-start"
            >
              {isLg && chunkSize > 1 ? (
                <div style={{ gridColumn: "1 / 3" }} aria-hidden />
              ) : null}
              {isTablet ? (
                <div style={{ gridColumn: "1 / 2" }} aria-hidden />
              ) : null}
              {row.map((project, slotIdx) => {
                const previewImage = getProjectImage(project);
                const col = 3 + slotIdx;
                const globalIdx = rowIdx * chunkSize + slotIdx;
                const gridColumn = isTablet
                  ? `${2 + slotIdx} / ${3 + slotIdx}`
                  : isMobile
                    ? "1 / 3"
                    : `${col} / ${col + 1}`;
                return (
                  <Link
                    key={project._id}
                    href={`/work/${project.slug.current}`}
                    className="no-underline"
                    style={{
                      gridColumn,
                      outline: "none",
                    }}
                    onMouseEnter={() => {
                      setHoveredIndex(globalIdx);
                      if (!isMobile) setPreviewVisible(true);
                    }}
                    onFocus={() => setHoveredIndex(globalIdx)}
                  >
                    {isMobile ? (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: previewImage
                            ? "minmax(0, 1fr) 40px"
                            : "minmax(0, 1fr)",
                          columnGap: "var(--spacing-gutter)",
                          alignItems: "start",
                          width: "100%",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 0,
                            minWidth: 0,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              flexWrap: "nowrap",
                              alignItems: "baseline",
                              gap: 4,
                              minWidth: 0,
                            }}
                          >
                            <span
                              className="text-caption"
                              style={{
                                color: "var(--color-white)",
                                minWidth: 0,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {project.title}
                            </span>
                            {project.client?.trim() && (
                              <span
                                className="text-caption"
                                style={{
                                  color: "rgba(255, 255, 255, 0.5)",
                                  flexShrink: 0,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {project.client.trim()}
                              </span>
                            )}
                          </div>
                          {project.tags && project.tags.length > 0 ? (
                            <div style={{ minWidth: 0 }}>
                              <span
                                className="text-caption"
                                style={{
                                  display: "block",
                                  color: "var(--color-primary)",
                                }}
                              >
                                {project.tags.map(formatSanityTag).join(", ")}
                              </span>
                            </div>
                          ) : null}
                        </div>
                        {previewImage ? (
                          <div
                            style={{
                              width: 40,
                              justifySelf: "end",
                            }}
                          >
                            <Image
                              loader={sanityLoader}
                              src={sanityImageUrl(previewImage)}
                              alt=""
                              width={40}
                              height={53}
                              sizes="40px"
                              quality={85}
                              style={{
                                width: 40,
                                height: "auto",
                                maxWidth: "100%",
                                display: "block",
                              }}
                            />
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            flexWrap: "wrap",
                            alignItems: "baseline",
                            gap: 8,
                          }}
                        >
                          <span
                            className="text-caption"
                            style={{ color: "var(--color-white)" }}
                          >
                            {project.title}
                          </span>
                          {project.client?.trim() && (
                            <span
                              className="text-caption"
                              style={{
                                color: "rgba(255, 255, 255, 0.5)",
                              }}
                            >
                              {project.client.trim()}
                            </span>
                          )}
                        </div>
                        {project.tags && project.tags.length > 0 && (
                          <span
                            className="text-caption"
                            style={{
                              display: "block",
                              color: "var(--color-primary)",
                            }}
                          >
                            {project.tags.map(formatSanityTag).join(", ")}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* ── Work footer (filters): in-flow with page padding on md+ ── */}
        {!isMobile ? (
          <footer style={{ flexShrink: 0 }}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: 20 }}
            >
              {workFooterFilterColumn}
              {workFooterVenice}
            </div>
          </footer>
        ) : null}
      </div>

      {/* Mobile: fixed full-bleed footer (outside padded content layer) ── */}
      {isMobile ? (
        <footer
          className="bg-black/5 backdrop-blur-md"
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 50,
            width: "100%",
            boxSizing: "border-box",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          <div
            className="page-grid items-end"
            style={{
              paddingLeft: "var(--spacing-margin)",
              paddingRight: "var(--spacing-margin)",
              paddingTop: "var(--spacing-margin)",
              paddingBottom: "var(--spacing-margin)",
            }}
          >
            <div style={{ gridColumn: "1 / 2", minWidth: 0 }}>
              {workFooterFilterColumn}
            </div>
            <div
              style={{
                gridColumn: "2 / 3",
                justifySelf: "end",
                textAlign: "right",
                alignSelf: "end",
              }}
            >
              {workFooterVenice}
            </div>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
