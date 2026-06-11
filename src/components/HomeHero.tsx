"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";

export default function HomeHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const heroScrollPadding = useTransform(scrollYProgress, (progress) => {
    const padding = 200 * progress;
    return `${padding}px`;
  });
  const backgroundMask = useTransform(scrollYProgress, (progress) => {
    const fadePct = Math.min(1, progress / 0.5) * 100;
    if (fadePct <= 0) return "none";
    if (fadePct >= 100) {
      return "linear-gradient(to top, transparent 0%, transparent 100%)";
    }
    return `linear-gradient(to top, transparent 0%, transparent ${fadePct}%, black ${fadePct}%, black 100%)`;
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    document.documentElement.dataset.heroBgVisible =
      progress < 0.5 ? "true" : "false";
  });

  useEffect(() => {
    document.documentElement.dataset.heroBgVisible = "true";

    const video = videoRef.current;
    if (video) {
      void video.play().catch(() => {
        // Autoplay may be blocked until user interaction; muted loop still preferred.
      });
    }

    return () => {
      delete document.documentElement.dataset.heroBgVisible;
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-home-hero
      className="relative box-border min-h-[100dvh] w-full overflow-hidden"
      aria-label="Hero"
    >
      <motion.div
        className="home-hero-scroll-frame pointer-events-none absolute inset-0 box-border"
        style={{
          paddingLeft: heroScrollPadding,
          paddingRight: heroScrollPadding,
          WebkitMaskImage: backgroundMask,
          maskImage: backgroundMask,
        }}
        aria-hidden
      >
        <div className="relative h-full w-full overflow-hidden bg-white">
          <video
            ref={videoRef}
            src="/videos/dd-intro-video.mp4"
            poster="/images/daniel-hero-new.jpg"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-hidden
            className="h-full w-full object-cover"
          />
        </div>
      </motion.div>

      <motion.div
        className="home-hero-center pointer-events-none absolute inset-0 z-[2] box-border"
        style={{
          WebkitMaskImage: backgroundMask,
          maskImage: backgroundMask,
        }}
      >
        <div className="page-grid home-hero-center-grid">
          <div className="home-hero-center-titles">
            <div className="home-hero-center-names">
              <span className="text-body text-white">Daniel Derro</span>
              <span className="text-body text-white home-hero-center-studio">No School Studios</span>
            </div>
            <span className="text-caption" style={{ color: "var(--color-primary)" }}>
              Visual artist, Venice.
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
