"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { sanityImageUrl, sanityLoader } from "@/sanity/lib/image";
import { MOTION } from "@/lib/motion";
import SitePageFooter from "@/components/SitePageFooter";
import { useMediaQuery } from "@/lib/use-media-query";
import { hasNavigationOccurred } from "@/lib/nav-state";

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
/** Gap between strip thumbnails (px). */
const THUMB_GAP = 0;
/** Padding inside each bordered work row (px); matches `.work-row-frame`. */
const WORK_ROW_PADDING = 4;
/** Fallback aspect ratio (width / height) when intrinsic dims can't be parsed. */
const THUMB_FALLBACK_ASPECT = 4 / 3;

/** useLayoutEffect on the client, useEffect during SSR (avoids the dev warning). */
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

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
  return out;
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
 * Horizontal row of contain-sized thumbnails. Measures its own width and only
 * renders as many thumbnails as fully fit (plus the inter-thumb gaps) so the
 * strip never spills horizontally. Overflow is clipped as a safety net.
 */
function ThumbnailStrip({
  images,
  height,
  maxWidth,
}: {
  images: SanityImageField[];
  height: number;
  /** When set, fit only this many pixels of thumbnails (container shrink-wraps to content). */
  maxWidth?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({ count: 0, width: 0 });

  const sized = useMemo(
    () =>
      images.map((img) => {
        const dims = getSanityImageDims(img);
        const aspect = dims ? dims.width / dims.height : THUMB_FALLBACK_ASPECT;
        return { img, width: Math.max(1, Math.round(height * aspect)) };
      }),
    [images, height],
  );

  useIsoLayoutEffect(() => {
    const available = maxWidth;

    if (available === undefined) {
      setLayout({ count: 0, width: 0 });
      return;
    }

    let used = 0;
    let fit = 0;
    for (const item of sized) {
      const next = fit === 0 ? item.width : THUMB_GAP + item.width;
      if (available > 0 && used + next > available) break;
      used += next;
      fit += 1;
    }

    setLayout({ count: fit, width: used });
  }, [sized, maxWidth]);

  if (layout.count === 0) return null;

  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        gap: THUMB_GAP,
        height,
        width: layout.width,
        maxWidth: "100%",
        overflow: "hidden",
        flex: "0 0 auto",
      }}
    >
      {sized.slice(0, layout.count).map((item, i) => (
        <div
          key={i}
          style={{
            position: "relative",
            height,
            width: item.width,
            flex: "0 0 auto",
          }}
        >
          <Image
            loader={sanityLoader}
            src={sanityImageUrl(item.img)}
            alt=""
            fill
            sizes={`${item.width}px`}
            quality={80}
            style={{ objectFit: "contain", objectPosition: "left center" }}
          />
        </div>
      ))}
    </div>
  );
}

function ProjectRow({
  project,
  index,
  isLg,
  isMd,
  thumbHeight,
  variants,
}: {
  project: WorkProject;
  index: number;
  isLg: boolean;
  isMd: boolean;
  thumbHeight: number;
  variants: Variants;
}) {
  const isMobile = !isMd;
  const number = formatNumber(index);
  const category = categoryLabel(project);
  const images = getStripImages(project);

  const rowRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const stripPlacementRef = useRef<HTMLDivElement>(null);
  const [stripMaxWidth, setStripMaxWidth] = useState<number | undefined>(undefined);
  const [frameRect, setFrameRect] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  const metaGridCol = isLg ? 3 : isMd ? 2 : 1;
  const mediaGridCol = isLg ? "4 / 7" : isMd ? "3 / 5" : 2;

  useIsoLayoutEffect(() => {
    const row = rowRef.current;
    const meta = metaRef.current;
    const media = stripPlacementRef.current;
    if (!row) return;

    const measure = () => {
      const rowRect = row.getBoundingClientRect();

      if (media) {
        const mediaRect = media.getBoundingClientRect();
        setStripMaxWidth(
          Math.max(0, rowRect.right - mediaRect.left - WORK_ROW_PADDING * 2),
        );
      }

      if (meta) {
        const metaRect = meta.getBoundingClientRect();
        const mediaRect = media?.getBoundingClientRect();
        const hasMedia = Boolean(mediaRect && mediaRect.width > 0);
        const topEdge = hasMedia
          ? Math.min(metaRect.top, mediaRect!.top)
          : metaRect.top;
        const bottomEdge = hasMedia
          ? Math.max(metaRect.bottom, mediaRect!.bottom)
          : metaRect.bottom;
        const rightEdge = hasMedia ? mediaRect!.right : metaRect.right;
        const pad = WORK_ROW_PADDING;

        setFrameRect({
          left: metaRect.left - rowRect.left - pad,
          top: topEdge - rowRect.top - pad,
          width: rightEdge - metaRect.left + pad * 2,
          height: bottomEdge - topEdge + pad * 2,
        });
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(row);
    if (meta) ro.observe(meta);
    if (media) ro.observe(media);
    return () => ro.disconnect();
  }, [isLg, isMd, thumbHeight, images.length]);

  return (
    <motion.li variants={variants} style={{ listStyle: "none" }}>
      <div ref={rowRef} className="work-row page-grid items-start">
        {isLg ? <div style={{ gridColumn: "1 / 3" }} aria-hidden /> : null}
        {isMd && !isLg ? <div style={{ gridColumn: "1 / 2" }} aria-hidden /> : null}

        {frameRect ? (
          <>
            <div
              className="work-row-frame"
              style={{
                left: frameRect.left,
                top: frameRect.top,
                width: frameRect.width,
                height: frameRect.height,
              }}
              aria-hidden
            />
            <Link
              href={`/work/${project.slug.current}`}
              className="work-row-hit"
              aria-label={project.title}
              style={{
                left: frameRect.left,
                top: frameRect.top,
                width: frameRect.width,
                height: frameRect.height,
              }}
            />
          </>
        ) : null}

        <div
          ref={metaRef}
          className="work-row-meta"
          style={{
            gridColumn: metaGridCol,
            minHeight: thumbHeight,
            display: "flex",
            flexDirection: isMobile ? "row" : "column",
            justifyContent: "space-between",
            alignItems: isMobile ? "flex-start" : "stretch",
            columnGap: isMobile ? 8 : undefined,
          }}
        >
          <span className="text-caption work-row-text-muted" style={{ flexShrink: 0 }}>
            {number}
          </span>
          <div style={{ minWidth: 0 }}>
            <span className="text-caption work-row-text-title block">
              {project.title}
            </span>
            <span className="text-caption work-row-text-muted block">
              {category}
            </span>
          </div>
        </div>

        <div
          ref={stripPlacementRef}
          className="work-row-media"
          style={{
            gridColumn: mediaGridCol,
            width: "max-content",
            maxWidth: "100%",
            justifySelf: "start",
          }}
        >
          <ThumbnailStrip images={images} height={thumbHeight} maxWidth={stripMaxWidth} />
        </div>
      </div>
    </motion.li>
  );
}

export default function WorkProjectGrid({
  projects,
}: {
  projects: WorkProject[];
}) {
  const isLg = useMediaQuery("(min-width: 1024px)");
  const isMd = useMediaQuery("(min-width: 768px)");
  const isSmallMobile = useMediaQuery("(max-width: 600px)");
  const reduceMotion = useReducedMotion();

  // Decide once, at mount: stagger only on a fresh load, not after an in-app
  // navigation (the page transition already animates the surface in).
  const [staggerOnLoad] = useState(() => !hasNavigationOccurred());
  const doStagger = staggerOnLoad && !reduceMotion;

  const thumbHeight = isSmallMobile ? THUMB_HEIGHT_SMALL : THUMB_HEIGHT;
  const rowGap = isMd ? 80 : 56;

  const listVariants: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: doStagger ? 0.05 : 0,
        delayChildren: doStagger ? 0.08 : 0,
      },
    },
  };

  const rowVariants: Variants = doStagger
    ? {
        hidden: { opacity: 0, filter: "blur(6px)" },
        show: {
          opacity: 1,
          filter: "blur(0px)",
          transition: { duration: 0.7, ease: MOTION.ease.heavy },
        },
      }
    : {
        hidden: { opacity: 1, filter: "blur(0px)" },
        show: { opacity: 1, filter: "blur(0px)" },
      };

  return (
    <main style={{ minHeight: "100dvh", background: "var(--color-black)" }}>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, filter: "blur(8px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: MOTION.ease.heavy }}
        className="pt-[var(--site-fixed-brand-strip-height)] md:pt-[calc(var(--spacing-margin)+env(safe-area-inset-top,0px))]"
        className="pb-[120px]"
        style={{
          paddingLeft: "var(--spacing-margin)",
          paddingRight: "var(--spacing-margin)",
          boxSizing: "border-box",
        }}
      >
        <motion.ol
          variants={listVariants}
          initial="hidden"
          animate="show"
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
              isLg={isLg}
              isMd={isMd}
              thumbHeight={thumbHeight}
              variants={rowVariants}
            />
          ))}
        </motion.ol>

        <SitePageFooter onDark />
      </motion.div>
    </main>
  );
}
