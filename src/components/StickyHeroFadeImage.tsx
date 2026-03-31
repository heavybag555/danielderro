"use client";

import Image from "next/image";
import { useEffect } from "react";
import { motion, useMotionValue } from "framer-motion";

const FADE_RANGE_PX = 360;

export default function StickyHeroFadeImage() {
  const opacity = useMotionValue(1);

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop;
      const scrollHeight = doc.scrollHeight;
      const clientHeight = window.innerHeight;
      const maxScroll = Math.max(0, scrollHeight - clientHeight);

      if (maxScroll <= 0) {
        opacity.set(1);
        return;
      }

      const distFromBottom = maxScroll - scrollTop;
      opacity.set(Math.min(1, Math.max(0, distFromBottom / FADE_RANGE_PX)));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(document.documentElement);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      resizeObserver.disconnect();
    };
  }, [opacity]);

  return (
    <motion.div
      style={{
        width: "100%",
        height: 240,
        position: "relative",
        overflow: "hidden",
        opacity,
      }}
    >
      <Image
        src="/images/hero.png"
        alt="Daniel Derro"
        fill
        style={{
          objectFit: "cover",
          filter: "grayscale(1)",
          opacity: 0.4,
        }}
        priority
      />
    </motion.div>
  );
}
