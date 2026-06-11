"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { sanityImageUrl, sanityLoader } from "@/sanity/lib/image";
import SitePageFooter from "@/components/SitePageFooter";
import { MOTION } from "@/lib/motion";
import {
  countFittingThumbnails,
  getThumbWidth,
} from "@/lib/work-strip-fit";

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

/** Most thumbnails considered per row; visible count is trimmed to fit width. */
const THUMB_MAX = 12;

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

function ThumbnailStrip({
  images,
  stripHeight,
}: {
  images: SanityImageField[];
  stripHeight: number;
}) {
  if (images.length === 0) return null;

  return (
    <div className="work-row-strip-inner">
      {images.map((img, i) => {
        const width = getThumbWidth(img, stripHeight);
        return (
          <div
            key={img.asset._ref ?? i}
            className="work-row-strip-thumb"
            style={{ width }}
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

function useFittingThumbnailCount(
  images: SanityImageField[],
  stripRef: React.RefObject<HTMLDivElement | null>,
) {
  const [visibleCount, setVisibleCount] = useState(images.length);
  const [stripHeight, setStripHeight] = useState(80);

  useLayoutEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    let frame = 0;

    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const height = strip.clientHeight;
        const width = strip.clientWidth;
        if (!height) return;
        setStripHeight(height);
        if (!width) return;
        setVisibleCount(countFittingThumbnails(images, height, width));
      });
    };

    const ro = new ResizeObserver(measure);
    ro.observe(strip);
    measure();

    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [images, stripRef]);

  return { visibleCount, stripHeight };
}

function ProjectRow({
  project,
  index,
  variants,
}: {
  project: WorkProject;
  index: number;
  variants?: Variants;
}) {
  const stripRef = useRef<HTMLDivElement>(null);
  const number = formatNumber(index);
  const category = categoryLabel(project);
  const images = getStripImages(project);
  const { visibleCount, stripHeight } = useFittingThumbnailCount(images, stripRef);
  const visibleImages = images.slice(0, visibleCount);

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
              minHeight: stripHeight,
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

          <div ref={stripRef} className="work-row-strip">
            <ThumbnailStrip images={visibleImages} stripHeight={stripHeight} />
          </div>
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
  const reduceMotion = useReducedMotion();
  const stagger = !reduceMotion;

  return (
    <main style={{ minHeight: "100dvh", background: "var(--color-black)" }}>
      <div
        className="site-page-content-offset site-page-bottom-padding"
        style={{
          paddingLeft: "var(--spacing-margin)",
          paddingRight: "var(--spacing-margin)",
          boxSizing: "border-box",
        }}
      >
        <motion.ol
          className="work-project-list"
          variants={stagger ? LIST_VARIANTS : undefined}
          initial={stagger ? "hidden" : false}
          animate={stagger ? "show" : undefined}
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: "var(--work-row-gap)",
          }}
        >
          {projects.map((project, index) => (
            <ProjectRow
              key={project._id}
              project={project}
              index={index}
              variants={stagger ? ROW_VARIANTS : undefined}
            />
          ))}
        </motion.ol>

        <SitePageFooter onDark />
      </div>
    </main>
  );
}
