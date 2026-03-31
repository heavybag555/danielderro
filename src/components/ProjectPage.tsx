"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";

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

function formatTag(tag: string): string {
  return tag
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

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

export default function ProjectPage({ project }: { project: Project }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const mediaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mediaItems = galleryToMedia(project.gallery ?? []);
  const total = mediaItems.length;

  useEffect(() => {
    const refs = mediaRefs.current;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-idx"));
            if (!isNaN(idx)) setActiveIndex(idx);
          }
        }
      },
      { threshold: 0.5 },
    );

    for (const ref of refs) {
      if (ref) observer.observe(ref);
    }

    return () => observer.disconnect();
  }, [total]);

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "var(--color-white)",
      }}
    >
      {/* ── Fixed header ──────────────────────────────────── */}
      <div
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
              className="text-h3 no-underline"
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
              className="text-h3 no-underline"
              style={{ color: "var(--color-black)" }}
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
              const isActive = item.label === "Return";
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`text-caption box-border flex min-w-0 flex-1 items-center justify-start border-[0.5px] px-1 py-0.5 no-underline ${
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

      {/* ── Fixed project info (left, vertically centered) ── */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: 12,
          transform: "translateY(-50%)",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div>
          <span
            className="text-body"
            style={{ color: "var(--color-black)", display: "block" }}
          >
            {project.title}
          </span>
          <span
            className="text-caption"
            style={{ color: "var(--color-primary)", display: "block" }}
          >
            {project.tags?.map(formatTag).join(", ")}
          </span>
        </div>
        {total > 0 && (
          <span className="text-body">
            <span style={{ color: "rgba(0, 0, 0, 0.5)" }}>
              {pad(activeIndex + 1)}
            </span>{" "}
            <span style={{ color: "var(--color-black)" }}>{pad(total)}</span>
          </span>
        )}
      </div>

      {/* ── Fixed close (right, vertically centered) ──────── */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          right: 12,
          transform: "translateY(-50%)",
          zIndex: 100,
        }}
      >
        <Link
          href="/work"
          className="text-body no-underline"
          style={{ color: "var(--color-black)" }}
        >
          Close
        </Link>
      </div>

      {/* ── Scrollable media column ──────────────────────── */}
      <main
        style={{
          paddingTop: 120,
          paddingBottom: 120,
          paddingLeft: 12,
          paddingRight: 12,
        }}
      >
        <div className="page-grid">
          <div style={{ gridColumn: "1 / 2" }} />
          <div
            style={{
              gridColumn: "2 / 6",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {mediaItems.map((item, idx) => (
              <div
                key={item._key}
                ref={(el) => {
                  mediaRefs.current[idx] = el;
                }}
                data-idx={idx}
                style={{ width: "100%", position: "relative" }}
              >
                <Image
                  src={urlFor(item.image)
                    .width(1200)
                    .quality(85)
                    .auto("format")
                    .url()}
                  alt={item.alt}
                  width={1200}
                  height={750}
                  sizes="(max-width: 768px) 100vw, 65vw"
                  style={{ width: "100%", height: "auto", display: "block" }}
                  priority={idx === 0}
                />
              </div>
            ))}
          </div>
          <div style={{ gridColumn: "6 / 7" }} />
        </div>
      </main>
    </div>
  );
}
