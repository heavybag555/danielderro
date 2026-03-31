"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { urlFor } from "@/sanity/lib/image";
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
  image: SanityImageField;
  alt: string;
};

function galleryEntriesToPreviewStills(
  entries: GalleryEntry[],
  slug: string
): PreviewStill[] {
  const out: PreviewStill[] = [];
  for (const entry of entries) {
    if (entry._type === "imageAsset" && entry.image?.asset?._ref) {
      out.push({
        _key: entry._key,
        slug,
        image: entry.image,
        alt: entry.alt?.trim() || entry.caption?.trim() || "",
      });
      continue;
    }
    if (entry._type === "videoAsset" && entry.thumbnail?.asset?._ref) {
      out.push({
        _key: entry._key,
        slug,
        image: entry.thumbnail,
        alt: entry.caption?.trim() || entry.title?.trim() || "",
      });
    }
  }
  return out;
}

function ProjectImages({ items }: { items: PreviewStill[] }) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  return (
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
            <Link
              href={`/work/${item.slug}`}
              style={{ display: "block" }}
            >
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
  );
}

export default function GallerySection({ projects }: Props) {
  const allStills = projects
    .flatMap((p) =>
      galleryEntriesToPreviewStills(p.gallery ?? [], p.slug.current)
    )
    .slice(0, 30);

  if (allStills.length === 0) {
    return null;
  }

  return (
    <section>
      <ProjectImages items={allStills} />
    </section>
  );
}
