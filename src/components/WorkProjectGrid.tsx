"use client";

import { useState, useCallback, useRef, useLayoutEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { sanityImageUrl, sanityLoader } from "@/sanity/lib/image";
import { formatSanityTag } from "@/lib/format-sanity-tag";
import { MOTION } from "@/lib/motion";
import SiteHeaderBand from "@/components/SiteHeaderBand";
import { useMediaQuery } from "@/lib/use-media-query";
import type { SiteNavItem } from "@/lib/site-nav";

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

const NAV_ITEMS: SiteNavItem[] = [
  { label: "Info", href: "/info" },
  { label: "Work", href: "/work" },
  { label: "Exhibitions", href: "/exhibitions", comingSoon: true },
  { label: "Radio", href: "/radio", comingSoon: true },
];

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
  const [tagBarHovered, setTagBarHovered] = useState(false);
  const [filterHoverKey, setFilterHoverKey] = useState<FilterKey | null>(null);

  const filtered = projects.filter((p) => matchesFilter(p, activeFilter));
  const activeProject =
    hoveredIndex !== null ? (filtered[hoveredIndex] ?? null) : null;
  const bgImage = activeProject ? getProjectImage(activeProject) : null;

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

  const workHeaderRef = useRef<HTMLDivElement>(null);
  const [workHeaderBlockHeight, setWorkHeaderBlockHeight] = useState(0);

  useLayoutEffect(() => {
    const el = workHeaderRef.current;
    if (!el) return;
    const measure = () => setWorkHeaderBlockHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
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
      {/* Background image — viewport-fixed; crossfades on hover; does not scroll with project list */}
      <AnimatePresence>
        {bgImage && !isMobile && (
          <motion.div
            key={sanityImageUrl(bgImage)}
            initial={{ opacity: 0 }}
            animate={{ opacity: isMobile ? 0.1 : 0.2 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: MOTION.duration.hover,
              ease: MOTION.ease.heavy,
            }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 0,
              pointerEvents: "none",
              display: isMobile ? "block" : "flex",
              alignItems: isMobile ? undefined : "center",
              justifyContent: isMobile ? undefined : "center",
              overflow: "hidden",
              filter: "grayscale(1)",
            }}
          >
            {isMobile ? (
              <div
                className="relative h-full w-full"
                style={{ minHeight: "100%" }}
              >
                <Image
                  loader={sanityLoader}
                  src={sanityImageUrl(bgImage)}
                  alt=""
                  fill
                  sizes="100vw"
                  quality={85}
                  style={{ objectFit: "cover" }}
                  priority
                />
              </div>
            ) : (
              <Image
                loader={sanityLoader}
                src={sanityImageUrl(bgImage)}
                alt=""
                width={1920}
                height={1080}
                sizes="100vw"
                quality={85}
                style={{
                  width: "auto",
                  height: "100%",
                  maxWidth: "none",
                }}
                priority
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed header — matches ProjectPage; stays pinned during overscroll */}
      <div
        ref={workHeaderRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          paddingTop: "calc(var(--spacing-margin) + env(safe-area-inset-top, 0px))",
          paddingLeft: "var(--spacing-margin)",
          paddingRight: "var(--spacing-margin)",
          boxSizing: "border-box",
        }}
      >
        <SiteHeaderBand
          navItems={NAV_ITEMS}
          variant="dark"
          isActive={(item) => item.href === "/work"}
          hideBrandBelowLg
        />
      </div>

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
            paddingTop:
              (workHeaderBlockHeight > 0 ? workHeaderBlockHeight + 10 : 10) +
              WORK_PROJECT_TEXT_PAD_Y,
            paddingBottom: isMobile
              ? `calc(${WORK_PROJECT_TEXT_PAD_Y}px + 168px + env(safe-area-inset-bottom, 0px))`
              : WORK_PROJECT_TEXT_PAD_Y,
          }}
        >
          {rows.map((row, rowIdx) => (
            <div key={rowIdx} className="page-grid items-start">
              {isLg && chunkSize > 1 ? (
                <div style={{ gridColumn: "1 / 3" }} aria-hidden />
              ) : null}
              {isTablet ? (
                <div style={{ gridColumn: "1 / 2" }} aria-hidden />
              ) : null}
              {row.map((project, slotIdx) => {
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
                    onMouseEnter={() => setHoveredIndex(globalIdx)}
                    onFocus={() => setHoveredIndex(globalIdx)}
                  >
                    {isMobile ? (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                          columnGap: "var(--spacing-gutter)",
                          alignItems: "start",
                          width: "100%",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            minWidth: 0,
                          }}
                        >
                          <span
                            className="text-body"
                            style={{ color: "var(--color-white)" }}
                          >
                            {project.title}
                          </span>
                          {project.client?.trim() && (
                            <span
                              className="text-body"
                              style={{
                                color: "rgba(255, 255, 255, 0.5)",
                              }}
                            >
                              {project.client.trim()}
                            </span>
                          )}
                        </div>
                        {project.tags && project.tags.length > 0 ? (
                          <div
                            style={{
                              minWidth: 0,
                              textAlign: "right",
                            }}
                          >
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
