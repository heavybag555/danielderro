"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { urlFor } from "@/sanity/lib/image";
import { formatSanityTag } from "@/lib/format-sanity-tag";
import { MOTION } from "@/lib/motion";

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
  coverImage?: { asset: { _ref: string } };
  gallery?: GalleryEntry[];
};

type Props = {
  projects: Project[];
};

type PreviewStill = {
  _key: string;
  slug: string;
  title: string;
  client?: string;
  tags: string[];
  image: SanityImageField;
  alt: string;
};

function galleryEntriesToPreviewStills(
  entries: GalleryEntry[],
  project: Project
): PreviewStill[] {
  const out: PreviewStill[] = [];
  for (const entry of entries) {
    if (entry._type === "imageAsset" && entry.image?.asset?._ref) {
      out.push({
        _key: `${project._id}__${entry._key}`,
        slug: project.slug.current,
        title: project.title,
        client: project.client,
        tags: project.tags ?? [],
        image: entry.image,
        alt: entry.alt?.trim() || entry.caption?.trim() || "",
      });
      continue;
    }
    if (entry._type === "videoAsset" && entry.thumbnail?.asset?._ref) {
      out.push({
        _key: `${project._id}__${entry._key}`,
        slug: project.slug.current,
        title: project.title,
        client: project.client,
        tags: project.tags ?? [],
        image: entry.thumbnail,
        alt: entry.caption?.trim() || entry.title?.trim() || "",
      });
    }
  }
  return out;
}

function HoverLabel({ item }: { item: PreviewStill }) {
  return (
    <div
      className="page-grid"
      style={{
        position: "fixed",
        top: "50%",
        left: 12,
        right: 12,
        transform: "translateY(-50%)",
        zIndex: 50,
        pointerEvents: "none",
        alignItems: "start",
      }}
    >
      <div
        style={{
          gridColumn: "3 / 4",
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
            className="text-meta-tight"
            style={{ color: "var(--color-black)" }}
          >
            {item.title}
          </span>
          {item.client?.trim() && (
            <span
              className="text-meta-tight"
              style={{
                color: "var(--color-black)",
                opacity: 0.5,
              }}
            >
              {item.client.trim()}
            </span>
          )}
        </div>
        {item.tags.length > 0 && (
          <span
            className="text-meta-tight"
            style={{
              display: "block",
              color: "var(--color-primary)",
            }}
          >
            {item.tags.map(formatSanityTag).join(", ")}
          </span>
        )}
      </div>
    </div>
  );
}

function ProjectImages({ items }: { items: PreviewStill[] }) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const hoveredItem = items.find((i) => i._key === hoveredKey) ?? null;

  return (
    <>
      <AnimatePresence>
        {hoveredItem && (
          <motion.div
            key={hoveredItem._key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: MOTION.duration.hover,
              ease: MOTION.ease.heavy,
            }}
          >
            <HoverLabel item={hoveredItem} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="page-grid" style={{ alignItems: "start", rowGap: 120 }}>
        {items.map((item) => {
          const dimmed = hoveredKey !== null && hoveredKey !== item._key;
          return (
            <motion.div
              key={item._key}
              onMouseEnter={() => setHoveredKey(item._key)}
              onMouseLeave={() => setHoveredKey(null)}
              animate={{
                opacity: dimmed ? 0.2 : 1,
                filter: dimmed ? "grayscale(100%)" : "grayscale(0%)",
              }}
              transition={{
                duration: MOTION.duration.hover,
                ease: MOTION.ease.heavy,
              }}
              style={{
                width: "100%",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Link href={`/work/${item.slug}`} style={{ display: "block" }}>
                <Image
                  src={urlFor(item.image)
                    .width(600)
                    .quality(85)
                    .auto("format")
                    .url()}
                  alt={item.alt}
                  width={600}
                  height={750}
                  sizes="(max-width: 768px) 50vw, 16vw"
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                  }}
                />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}

const STORAGE_KEY = "gallery-order-v1";
const MAX_IMAGES = 30;

type StoredGallery = {
  contentKey: string;
  keys: string[];
};

function getContentKey(projects: Project[]): string {
  return projects
    .map((p) => {
      const imageKeys = (p.gallery ?? [])
        .filter(
          (e) =>
            (e._type === "imageAsset" && (e as GalleryImage).image?.asset?._ref) ||
            (e._type === "videoAsset" && (e as GalleryVideo).thumbnail?.asset?._ref)
        )
        .map((e) => e._key)
        .join(",");
      return `${p._id}:${imageKeys}`;
    })
    .sort()
    .join("|");
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildFairGallery(projects: Project[]): PreviewStill[] {
  const projectStills = projects
    .map((p) => ({
      stills: galleryEntriesToPreviewStills(p.gallery ?? [], p),
    }))
    .filter((ps) => ps.stills.length > 0);

  const N = projectStills.length;
  if (N === 0) return [];

  const base = Math.floor(MAX_IMAGES / N);
  const extra = MAX_IMAGES % N;

  // Shuffle project order so representation is random
  const shuffledProjects = shuffle(projectStills);

  const result: PreviewStill[] = [];
  shuffledProjects.forEach((ps, idx) => {
    const quota = base + (idx < extra ? 1 : 0);
    if (quota === 0) return;
    // Shuffle which images from this project appear
    const picked = shuffle(ps.stills).slice(0, quota);
    result.push(...picked);
  });

  // Final interleave shuffle so same-project images don't cluster
  return shuffle(result);
}

export default function GallerySection({ projects }: Props) {
  const [stills, setStills] = useState<PreviewStill[] | null>(null);

  useEffect(() => {
    const contentKey = getContentKey(projects);

    // Build lookup for restoration
    const allStills = projects.flatMap((p) =>
      galleryEntriesToPreviewStills(p.gallery ?? [], p)
    );
    const lookup = new Map(allStills.map((s) => [s._key, s]));

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored: StoredGallery = JSON.parse(raw);
        if (stored.contentKey === contentKey) {
          const restored = stored.keys
            .map((k) => lookup.get(k))
            .filter((s): s is PreviewStill => s !== undefined);
          if (restored.length > 0) {
            setStills(restored);
            return;
          }
        }
      }
    } catch {
      // ignore parse errors
    }

    // First visit or content changed — generate and persist
    const generated = buildFairGallery(projects);
    setStills(generated);

    try {
      const toStore: StoredGallery = {
        contentKey,
        keys: generated.map((s) => s._key),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch {
      // ignore storage errors (e.g. private browsing quota)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (stills === null || stills.length === 0) return null;

  return (
    <section>
      <ProjectImages items={stills} />
    </section>
  );
}
