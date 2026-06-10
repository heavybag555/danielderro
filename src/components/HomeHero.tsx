"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { useLenis } from "lenis/react";

import { HOME_GALLERY_FADE_ANCHOR_ID } from "@/lib/home-gallery";
import { MOTION } from "@/lib/motion";
import {
  HERO_LOGOS,
  HERO_STACK_PORTRAIT,
  SITE_ABOUT_COPY,
  SITE_CLIENTS_COPY,
} from "@/lib/site-content";

/** Hero strip only — hide Most Wanted and No Cry Baby's; footer keeps all six. */
const HERO_STRIP_HIDDEN = new Set([
  "/images/hero/logo-most-wanted.png",
  "/images/hero/logo-no-cry-babys.png",
]);
const HERO_STRIP_LOGOS = HERO_LOGOS.filter((logo) => !HERO_STRIP_HIDDEN.has(logo.src));

function isHeroFullyInViewport(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  return rect.top >= -1 && rect.bottom <= window.innerHeight + 1;
}

export default function HomeHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const lenis = useLenis();

  // The View Gallery button only shows while the hero fully fills the viewport.
  const [heroFullyVisible, setHeroFullyVisible] = useState(true);

  // 0 when the hero fills the viewport → 1 once it has scrolled fully out of view.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  // Background wipes out from the bottom upward over the first half of the exit.
  const backgroundMask = useTransform(scrollYProgress, (progress) => {
    const fadePct = Math.min(1, progress / 0.5) * 100;
    if (fadePct <= 0) return "none";
    if (fadePct >= 100) {
      return "linear-gradient(to top, transparent 0%, transparent 100%)";
    }
    return `linear-gradient(to top, transparent 0%, transparent ${fadePct}%, black ${fadePct}%, black 100%)`;
  });

  const syncHeroVisibility = useCallback(() => {
    const hero = sectionRef.current;
    setHeroFullyVisible(hero ? isHeroFullyInViewport(hero) : false);
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    document.documentElement.dataset.heroBgVisible =
      progress < 0.5 ? "true" : "false";
    syncHeroVisibility();
  });

  useEffect(() => {
    document.documentElement.dataset.heroBgVisible = "true";
    syncHeroVisibility();
    window.addEventListener("resize", syncHeroVisibility);
    return () => {
      window.removeEventListener("resize", syncHeroVisibility);
      delete document.documentElement.dataset.heroBgVisible;
    };
  }, [syncHeroVisibility]);

  const scrollToGallery = () => {
    const target = document.getElementById(HOME_GALLERY_FADE_ANCHOR_ID);
    if (!target) return;
    if (lenis) {
      lenis.scrollTo(target, { offset: 0, duration: MOTION.duration.slow });
    } else {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      ref={sectionRef}
      data-home-hero
      className="relative box-border flex min-h-[100dvh] w-full items-center justify-center overflow-hidden px-[var(--spacing-margin)]"
      aria-label="Hero"
    >
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          WebkitMaskImage: backgroundMask,
          maskImage: backgroundMask,
        }}
        aria-hidden
      >
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/images/daniel-hero-new.jpg"
            alt=""
            className="h-full w-full scale-[1.03] object-cover blur-[8px]"
            decoding="async"
            fetchPriority="high"
          />
        </div>
        <div className="hero-grain" />
      </motion.div>

      <motion.div
        className="relative z-[2] w-full"
        style={{ opacity: contentOpacity }}
      >
        <div className="page-grid w-full">
          <div className="col-span-2 col-start-2 flex flex-col items-start md:col-start-2 lg:col-start-3 lg:col-span-2">
            <span className="bg-black px-[2px] py-0 text-heading text-white">
              Daniel Derro
            </span>
            <span className="bg-black px-[2px] py-0 text-heading text-white">
              No School Studios
            </span>
          </div>

          <div className="col-span-2 col-start-2 mt-5 flex min-w-0 flex-col items-start gap-5 text-left md:col-start-2 lg:col-start-3 lg:col-span-2">
            <p
              className="text-caption w-[240px] max-w-full shrink-0"
              style={{ color: "var(--color-primary)", margin: 0 }}
            >
              <span style={{ color: "var(--color-white)" }}>About </span>
              {SITE_ABOUT_COPY}
            </p>

            <p
              className="text-caption w-[240px] max-w-full shrink-0"
              style={{ color: "var(--color-primary)", margin: 0 }}
            >
              <span style={{ color: "var(--color-white)" }}>Clients </span>
              {SITE_CLIENTS_COPY}
            </p>

            <div className="flex flex-wrap items-center justify-start gap-0">
              <img
                src={HERO_STACK_PORTRAIT.src}
                alt={HERO_STACK_PORTRAIT.alt}
                width={HERO_STACK_PORTRAIT.width}
                height={HERO_STACK_PORTRAIT.height}
                className="box-border block h-[32px] w-auto shrink-0 border-[0.5px] object-contain"
                style={{ objectFit: "contain", borderColor: "var(--color-white)" }}
              />
              {HERO_STRIP_LOGOS.map((logo) => (
                <img
                  key={logo.src}
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.width}
                  height={logo.height}
                  className="box-border block h-[32px] w-auto shrink-0 border-[0.5px] object-contain"
                  style={{ objectFit: "contain", borderColor: "var(--color-white)" }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute right-0 bottom-0 left-0 z-[2] box-border px-[var(--spacing-margin)]"
        animate={{ opacity: heroFullyVisible ? 1 : 0 }}
        transition={{ duration: MOTION.duration.fade, ease: MOTION.ease.heavy }}
        style={{
          pointerEvents: heroFullyVisible ? "auto" : "none",
          paddingBottom: "calc(var(--spacing-margin) + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="page-grid w-full">
          <div className="col-span-2 col-start-2 flex justify-start md:col-start-2 lg:col-start-3 lg:col-span-2">
            <button
              type="button"
              className="hover-smooth cursor-pointer border-0 bg-black px-[2px] py-0 text-caption text-white hover:bg-white hover:text-black"
              onClick={scrollToGallery}
            >
              View Gallery
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
