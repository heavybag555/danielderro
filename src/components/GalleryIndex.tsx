"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { sanityLoader } from "@/sanity/lib/image";
import SitePageFooter from "@/components/SitePageFooter";
import { mediaEnterTransition, MOTION } from "@/lib/motion";
import { useMediaQuery } from "@/lib/use-media-query";
import { useDismissOnScroll } from "@/lib/use-dismiss-on-scroll";
import type { GalleryStill } from "@/lib/gallery-stills";

const HOVER_HOLD_MS = 150;

const TILE_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  show: (index: number) => ({
    opacity: 1,
    transition: mediaEnterTransition(index),
  }),
};

export default function GalleryIndex({
  stills,
}: {
  stills: GalleryStill[];
}) {
  const reduceMotion = useReducedMotion();
  const stagger = !reduceMotion;
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const hoverTimer = useRef<number | null>(null);
  const hovered = stills.find((still) => still.key === hoveredKey) ?? null;
  const [lastHovered, setLastHovered] = useState<GalleryStill | null>(null);
  const meta = hovered ?? lastHovered;

  useEffect(() => {
    if (hovered) setLastHovered(hovered);
  }, [hovered]);

  const clearHoverTimer = () => {
    if (hoverTimer.current !== null) {
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  const requestHover = (key: string | null) => {
    if (isMobile) return;
    clearHoverTimer();
    if (!key) {
      setHoveredKey(null);
      return;
    }
    hoverTimer.current = window.setTimeout(() => {
      setHoveredKey(key);
    }, HOVER_HOLD_MS);
  };

  useDismissOnScroll(() => {
    clearHoverTimer();
    setHoveredKey(null);
  });

  useEffect(() => clearHoverTimer, []);

  return (
    <main id="main-content" className="gallery-page-shell">
      <h1 className="visually-hidden">Gallery</h1>

      <div className="layout-full site-page-content-offset gallery-page-content">
        <motion.div
          className="layout-grid gallery-index"
          initial={stagger ? "hidden" : false}
          animate={stagger ? "show" : undefined}
          onMouseLeave={() => requestHover(null)}
        >
          {stills.map((still, index) => {
            const dimmed = hoveredKey !== null && hoveredKey !== still.key;
            return (
              <motion.div
                key={still.key}
                className="gallery-index-tile"
                custom={index}
                variants={stagger ? TILE_VARIANTS : undefined}
              >
                <Link
                  href={`/work/${still.slug}`}
                  aria-label={still.title}
                  className="gallery-index-link"
                  onPointerEnter={() => requestHover(still.key)}
                  onPointerLeave={() => requestHover(null)}
                >
                  <span
                    className="gallery-index-media"
                    data-dimmed={dimmed ? "true" : "false"}
                    style={{ aspectRatio: still.aspect }}
                  >
                    <Image
                      {...(still.remote ? {} : { loader: sanityLoader })}
                      src={still.src}
                      alt=""
                      fill
                      sizes="(max-width: 767px) 50vw, (max-width: 1023px) 25vw, 12.5vw"
                      quality={90}
                      style={{ objectFit: "contain" }}
                    />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <SitePageFooter />
      </div>

      <motion.div
        className="gallery-hover-meta blend-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{
          duration: reduceMotion ? 0 : 0.32,
          ease: MOTION.ease.heavy,
        }}
        aria-hidden={!hovered}
      >
        {meta ? (
          <p className="layout-grid site-meta-row text-caption">
            <span className="site-meta-client">{meta.client}</span>
            <span className="site-meta-title">{meta.title}</span>
            <span className="site-meta-tags">{meta.tags}</span>
          </p>
        ) : null}
      </motion.div>
    </main>
  );
}
