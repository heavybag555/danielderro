"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { sanityImageUrl, sanityLoader } from "@/sanity/lib/image";
import { formatSanityTag } from "@/lib/format-sanity-tag";
import { MOTION } from "@/lib/motion";
import type { HomeGalleryStill } from "@/lib/home-gallery";

/** Staggered enter: a gentle opacity + blur cascade across the grid (no slide). */
const GRID_VARIANTS: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.025, delayChildren: 0.05 } },
};

const ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, filter: "blur(6px)" },
  show: {
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: MOTION.ease.heavy },
  },
};

/** Hover label only appears after the pointer rests briefly — avoids flash on quick passes. */
const HOVER_LABEL_DELAY_MS = 220;

function HoverLabel({ item }: { item: HomeGalleryStill }) {
  return (
    <div
      className="page-grid items-start"
      style={{
        position: "fixed",
        top: "50%",
        left: "var(--spacing-margin)",
        right: "var(--spacing-margin)",
        transform: "translateY(-50%)",
        zIndex: 50,
        pointerEvents: "none",
      }}
    >
      <div className="col-span-2 flex flex-col gap-0.5 md:col-span-1 md:col-start-4 lg:col-start-2 lg:col-span-3 xl:col-start-4 xl:col-span-2">
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "baseline",
            gap: 8,
          }}
        >
          <span className="text-micro-tight" style={{ color: "var(--color-black)" }}>
            {item.title}
          </span>
          {item.client?.trim() && (
            <span
              className="text-micro-tight"
              style={{ color: "var(--color-black)", opacity: 0.5 }}
            >
              {item.client.trim()}
            </span>
          )}
        </div>
        {item.tags.length > 0 && (
          <span
            className="text-micro-tight"
            style={{ display: "block", color: "var(--color-primary)" }}
          >
            {item.tags.map(formatSanityTag).join(", ")}
          </span>
        )}
      </div>
    </div>
  );
}

export default function GallerySection({
  stills,
}: {
  stills: HomeGalleryStill[];
}) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [stableHoveredKey, setStableHoveredKey] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  // Dim tracks the pointer immediately; the center label waits for a brief rest.
  useEffect(() => {
    if (reduceMotion) {
      setStableHoveredKey(hoveredKey);
      return;
    }
    if (!hoveredKey) {
      setStableHoveredKey(null);
      return;
    }
    const id = window.setTimeout(
      () => setStableHoveredKey(hoveredKey),
      HOVER_LABEL_DELAY_MS,
    );
    return () => window.clearTimeout(id);
  }, [hoveredKey, reduceMotion]);

  const labelItem =
    stableHoveredKey !== null
      ? (stills.find((i) => i._key === stableHoveredKey) ?? null)
      : null;

  if (stills.length === 0) return null;

  return (
    <section>
      <div className="page-grid items-start">
        <div className="hidden xl:col-span-2 xl:block" aria-hidden />
        <motion.div
          className="col-span-2 grid grid-cols-2 items-start md:col-span-4 md:grid-cols-4 lg:col-span-6 lg:col-start-1 lg:grid-cols-5 xl:col-start-3 xl:grid-cols-6"
          style={{ gap: "var(--spacing-gutter)" }}
          variants={reduceMotion ? undefined : GRID_VARIANTS}
          initial={reduceMotion ? false : "hidden"}
          animate={reduceMotion ? undefined : "show"}
          onMouseLeave={() => setHoveredKey(null)}
        >
          {stills.map((item) => {
            const dimmed = hoveredKey !== null && hoveredKey !== item._key;
            return (
              <motion.div
                key={item._key}
                className="min-w-0"
                variants={reduceMotion ? undefined : ITEM_VARIANTS}
                style={{ width: "100%" }}
              >
                <div
                  className="gallery-tile-media"
                  data-dimmed={dimmed ? "true" : "false"}
                  onMouseEnter={() => setHoveredKey(item._key)}
                  style={{ width: "100%", position: "relative", overflow: "hidden" }}
                >
                  <Link href={`/work/${item.slug}`} style={{ display: "block" }}>
                    <Image
                      loader={sanityLoader}
                      src={sanityImageUrl(item.image)}
                      alt={item.alt}
                      width={600}
                      height={750}
                      sizes="(max-width: 767px) 50vw, (max-width: 1023px) 25vw, 10vw"
                      quality={90}
                      style={{ width: "100%", height: "auto", display: "block" }}
                    />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
        <div className="hidden xl:col-span-2 xl:block" aria-hidden />
      </div>

      {/* Single persistent overlay — content swaps without exit/enter remounts. */}
      <motion.div
        className="blend-overlay"
        animate={{ opacity: labelItem ? 1 : 0 }}
        transition={{ duration: MOTION.duration.hover, ease: MOTION.ease.heavy }}
        style={{ position: "fixed", inset: 0, zIndex: 100, pointerEvents: "none" }}
        aria-hidden={!labelItem}
      >
        {labelItem ? <HoverLabel item={labelItem} /> : null}
      </motion.div>
    </section>
  );
}
