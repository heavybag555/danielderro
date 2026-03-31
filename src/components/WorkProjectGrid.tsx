"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";

type SanityImageField = {
  asset: { _ref: string };
  hotspot?: { x: number; y: number };
};

type WorkProject = {
  _id: string;
  title: string;
  slug: { current: string };
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
  { key: "nss", label: "No School Studio" },
];

function formatTag(tag: string): string {
  return tag
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

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
  const [activeFilter, setActiveFilter] = useState<FilterKey | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
    setHoveredIndex(null);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
        overflow: "hidden",
        background: "#292929",
      }}
    >
      {/* Background image — swaps on hover */}
      {bgImage && (
        <Image
          src={urlFor(bgImage).width(1920).quality(80).auto("format").url()}
          alt=""
          fill
          sizes="100vw"
          style={{ objectFit: "cover" }}
          priority
        />
      )}

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
              className="text-h3 no-underline"
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
              className="text-h3 no-underline"
              style={{ color: "var(--color-white)" }}
            >
              No School Studios
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
                  className={`text-caption box-border flex min-w-0 flex-1 items-center justify-start border-[0.5px] px-1 py-0.5 no-underline ${
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
              <div style={{ gridColumn: "1 / 2" }} />

              {row.map((project, colIdx) => {
                const globalIdx = rowIdx * 4 + colIdx;
                return (
                  <Link
                    key={project._id}
                    href={`/work/${project.slug.current}`}
                    className="no-underline"
                    style={{
                      gridColumn: `${colIdx + 2} / ${colIdx + 3}`,
                      outline: "none",
                    }}
                    onMouseEnter={() => setHoveredIndex(globalIdx)}
                    onFocus={() => setHoveredIndex(globalIdx)}
                  >
                    <span
                      className="text-body"
                      style={{
                        color: "var(--color-white)",
                        display: "block",
                      }}
                    >
                      {project.title}
                    </span>
                    <span
                      className="text-caption"
                      style={{
                        color: "var(--color-white)",
                        display: "block",
                      }}
                    >
                      {project.tags?.map(formatTag).join(", ") || "\u00A0"}
                    </span>
                  </Link>
                );
              })}

              <div style={{ gridColumn: "6 / 7" }} />
            </div>
          ))}
        </div>

        {/* ── Work footer (filters + close) ──────────────── */}
        <footer
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexShrink: 0,
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: 20 }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => toggleFilter(f.key)}
                  className="text-body"
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    textAlign: "left",
                    color:
                      activeFilter === null || activeFilter === f.key
                        ? "var(--color-white)"
                        : "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <span
              className="text-caption"
              style={{ color: "var(--color-primary)" }}
            >
              Venice, California
            </span>
          </div>

          <Link
            href="/"
            className="text-body no-underline"
            style={{ color: "var(--color-white)" }}
          >
            Close
          </Link>
        </footer>
      </div>
    </div>
  );
}
