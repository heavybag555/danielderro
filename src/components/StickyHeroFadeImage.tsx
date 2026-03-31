"use client";

import Image from "next/image";
import { useEffect } from "react";
import { motion, useMotionValue } from "framer-motion";

/** Sentinel id on the home page: top edge of the gallery (see `page.tsx`). */
export const HOME_GALLERY_FADE_ANCHOR_ID = "home-gallery-fade-anchor";

/** When the gallery top is below this viewport Y, portrait stays fully visible. */
const FADE_START_VIEWPORT_TOP_PX = 780;
/** When the gallery top is above this viewport Y, portrait is fully faded (before overlap with sticky hero). */
const FADE_END_VIEWPORT_TOP_PX = 260;

export default function StickyHeroFadeImage() {
  const opacity = useMotionValue(1);

  useEffect(() => {
    const update = () => {
      const anchor = document.getElementById(HOME_GALLERY_FADE_ANCHOR_ID);
      if (!anchor) {
        opacity.set(1);
        return;
      }

      const top = anchor.getBoundingClientRect().top;
      const range = FADE_START_VIEWPORT_TOP_PX - FADE_END_VIEWPORT_TOP_PX;
      if (range <= 0) {
        opacity.set(1);
        return;
      }

      const t = (top - FADE_END_VIEWPORT_TOP_PX) / range;
      opacity.set(Math.min(1, Math.max(0, t)));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(document.documentElement);
    const anchor = document.getElementById(HOME_GALLERY_FADE_ANCHOR_ID);
    if (anchor) resizeObserver.observe(anchor);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      resizeObserver.disconnect();
    };
  }, [opacity]);

  return (
    <motion.div style={{ width: "100%", display: "flex", flexDirection: "column", opacity }}>
      <Image
        src="/images/daniel-hero-new.jpg"
        alt="Daniel Derro"
        width={2000}
        height={1470}
        style={{ width: "100%", height: "auto", display: "block" }}
        priority
      />
      <Image
        src="/images/daniel-hero-bottom.jpeg"
        alt="Daniel Derro"
        width={1441}
        height={1200}
        style={{ width: "100%", height: "auto", display: "block" }}
      />
    </motion.div>
  );
}
