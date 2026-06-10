"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { sanityImageUrl, sanityLoader } from "@/sanity/lib/image";
import SitePageFooter from "@/components/SitePageFooter";
import { MOTION } from "@/lib/motion";
import { useMediaQuery } from "@/lib/use-media-query";

/** Staggered enter: opacity + blur cascade down the list (no slide). */
const LIST_VARIANTS: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};

const ROW_VARIANTS: Variants = {
  hidden: { opacity: 0, filter: "blur(6px)" },
  show: {
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: MOTION.ease.heavy },
  },
};

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
  galleryThumbs?: { image?: SanityImageField }[];
};

/** Thumbnail strip heights (px). */
const THUMB_HEIGHT = 80;
const THUMB_HEIGHT_SMALL = 60;
/** Most thumbnails to render per row; extras beyond the strip width are clipped. */
const THUMB_MAX = 12;
/** Fallback aspect ratio (width / height) when intrinsic dims can't be parsed. */
const THUMB_FALLBACK_ASPECT = 4 / 3;

/** Parse intrinsic dimensions from a Sanity asset `_ref`, e.g. `image-<hash>-1920x1080-jpg`. */
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

/** Cover image first, then gallery thumbnails — deduped by asset ref. */
function getStripImages(project: WorkProject): SanityImageField[] {
  const raw: (SanityImageField | undefined)[] = [
    project.coverImage,
    ...(project.galleryThumbs ?? []).map((g) => g?.image),
  ];
  const seen = new Set<string>();
  const out: SanityImageField[] = [];
  for (const img of raw) {
    const ref = img?.asset?._ref;
    if (!ref || seen.has(ref)) continue;
    seen.add(ref);
    out.push(img);
  }
  return out.slice(0, THUMB_MAX);
}

/**
 * Normalized category: commissioned work (has a client) reads as "Commercial",
 * everything else (or an explicit `personal` tag) reads as "Personal".
 */
function categoryLabel(project: WorkProject): string {
  if (project.tags?.includes("personal")) return "Personal";
  if (project.client?.trim()) return "Commercial";
  return "Personal";
}

function formatNumber(index: number): string {
  return String(index + 1).padStart(3, "0");
}

/**
 * Horizontal row of contain-sized thumbnails. The parent link clips overflow,
 * so the strip simply lays out left-to-right and any thumbnails past the
 * available width are hidden — no measurement needed.
 */
function ThumbnailStrip({
  images,
  height,
}: {
  images: SanityImageField[];
  height: number;
}) {
  if (images.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        gap: 0,
        height,
        minWidth: 0,
        maxWidth: "100%",
        overflow: "hidden",
        flex: "0 1 auto",
      }}
    >
      {images.map((img, i) => {
        const dims = getSanityImageDims(img);
        const aspect = dims ? dims.width / dims.height : THUMB_FALLBACK_ASPECT;
        const width = Math.max(1, Math.round(height * aspect));
        return (
          <div
            key={i}
            style={{ position: "relative", height, width, flex: "0 0 auto" }}
          >
            <Image
              loader={sanityLoader}
              src={sanityImageUrl(img)}
              alt=""
              fill
              sizes={`${width}px`}
              quality={80}
              style={{ objectFit: "contain", objectPosition: "left top" }}
            />
          </div>
        );
      })}
    </div>
  );
}

function ProjectRow({
  project,
  index,
  thumbHeight,
  variants,
}: {
  project: WorkProject;
  index: number;
  thumbHeight: number;
  variants?: Variants;
}) {
  const number = formatNumber(index);
  const category = categoryLabel(project);
  const images = getStripImages(project);

  return (
    <motion.li variants={variants} style={{ listStyle: "none" }}>
      <div className="work-row page-grid items-start">
        <Link
          href={`/work/${project.slug.current}`}
          aria-label={project.title}
          className="work-row-link"
        >
          <div
            className="work-row-meta"
            style={{
              minHeight: thumbHeight,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <span
              className="text-caption work-row-text-muted"
              style={{ flexShrink: 0 }}
            >
              {number}
            </span>
            <div className="work-row-text-stack">
              <span className="text-caption work-row-text-title block">
                {project.title}
              </span>
              <span className="text-caption work-row-text-muted block">
                {category}
              </span>
            </div>
          </div>

          <ThumbnailStrip images={images} height={thumbHeight} />
        </Link>
      </div>
    </motion.li>
  );
}

export default function WorkProjectGrid({
  projects,
}: {
  projects: WorkProject[];
}) {
  const isSmallMobile = useMediaQuery("(max-width: 600px)");
  const isMd = useMediaQuery("(min-width: 768px)");
  const reduceMotion = useReducedMotion();

  const thumbHeight = isSmallMobile ? THUMB_HEIGHT_SMALL : THUMB_HEIGHT;
  const rowGap = isMd ? 80 : 56;
  const stagger = !reduceMotion;

  return (
    <main style={{ minHeight: "100dvh", background: "var(--color-black)" }}>
      <div
        className="pb-[120px] pt-[calc(var(--spacing-margin)+env(safe-area-inset-top,0px))]"
        style={{
          paddingLeft: "var(--spacing-margin)",
          paddingRight: "var(--spacing-margin)",
          boxSizing: "border-box",
        }}
      >
        <motion.ol
          variants={stagger ? LIST_VARIANTS : undefined}
          initial={stagger ? "hidden" : false}
          animate={stagger ? "show" : undefined}
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: rowGap,
          }}
        >
          {projects.map((project, index) => (
            <ProjectRow
              key={project._id}
              project={project}
              index={index}
              thumbHeight={thumbHeight}
              variants={stagger ? ROW_VARIANTS : undefined}
            />
          ))}
        </motion.ol>

        <SitePageFooter onDark />
      </div>
    </main>
  );
}
