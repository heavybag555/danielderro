"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { sanityImageUrl, sanityLoader } from "@/sanity/lib/image";
import { formatSanityTag } from "@/lib/format-sanity-tag";
import { MOTION } from "@/lib/motion";

type SanityImageField = {
  asset: { _ref: string };
  hotspot?: { x: number; y: number };
};

type WorkProject = {
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

const NAV_ITEMS = [
  { label: "Info", href: "/info" },
  { label: "Work", href: "/work" },
  { label: "Exhibitions", href: "/exhibitions" },
  { label: "Radio", href: "/radio" },
];

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "photo", label: "Photo" },
  { key: "motion", label: "Motion" },
  { key: "nss", label: "No-School Studio Records" },
];

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

  const rows: WorkProject[][] = [];
  for (let i = 0; i < filtered.length; i += 4) {
    rows.push(filtered.slice(i, i + 4));
  }

  const toggleFilter = useCallback((key: FilterKey) => {
    setActiveFilter((prev) => (prev === key ? null : key));
    setHoveredIndex(0);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
        overflow: "hidden",
        background: "#000000",
      }}
    >
      {/* Background image — crossfades on hover */}
      <AnimatePresence>
        {bgImage && (
          <motion.div
            key={sanityImageUrl(bgImage)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: MOTION.duration.hover,
              ease: MOTION.ease.heavy,
            }}
            style={{
              position: "absolute",
              inset: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              filter: "grayscale(1)",
            }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content layer */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          padding: 12,
          boxSizing: "border-box",
          gap: 10,
        }}
      >
        {/* ── Header ─────────────────────────────────────── */}
        <header
          className="page-grid"
          style={{ alignItems: "center", flexShrink: 0 }}
        >
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
              style={{ color: "var(--color-white)" }}
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
              style={{ color: "var(--color-white)" }}
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
              const isActive = item.href === "/work";
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`hover-smooth text-caption box-border flex min-w-0 flex-1 items-center justify-start border-[0.5px] px-1 py-0.5 no-underline ${
                    isActive
                      ? "border-transparent bg-(--color-white) text-(--color-black)"
                      : "border-(--color-white) text-(--color-white) hover:border-transparent hover:bg-(--color-white) hover:text-(--color-black)"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        {/* ── Project rows (centered) ────────────────────── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 120,
            overflow: "hidden",
          }}
        >
          {rows.map((row, rowIdx) => (
            <div
              key={rowIdx}
              className="page-grid"
              style={{ alignItems: "start" }}
            >
              <div style={{ gridColumn: "1 / 3" }} aria-hidden />
              {row.map((project, slotIdx) => {
                const col = 3 + slotIdx;
                const globalIdx = rowIdx * 4 + slotIdx;
                return (
                  <Link
                    key={project._id}
                    href={`/work/${project.slug.current}`}
                    className="no-underline"
                    style={{
                      gridColumn: `${col} / ${col + 1}`,
                      outline: "none",
                    }}
                    onMouseEnter={() => setHoveredIndex(globalIdx)}
                    onFocus={() => setHoveredIndex(globalIdx)}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
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
                          className="text-meta-tight"
                          style={{
                            display: "block",
                            color: "var(--color-primary)",
                          }}
                        >
                          {project.tags.map(formatSanityTag).join(", ")}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* ── Work footer (filters) ───────────────────────── */}
        <footer style={{ flexShrink: 0 }}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: 20 }}
          >
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
            <span
              className="text-caption"
              style={{ color: "var(--color-primary)" }}
            >
              Venice, California
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
