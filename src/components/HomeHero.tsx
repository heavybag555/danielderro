"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useLenis } from "lenis/react";

import { HOME_GALLERY_FADE_ANCHOR_ID } from "@/lib/home-gallery";
import { MOTION } from "@/lib/motion";
import {
  HERO_LOGOS,
  HERO_STACK_PORTRAIT,
  SITE_ABOUT_COPY,
  SITE_CLIENTS_COPY,
} from "@/lib/site-content";

const GALLERY_SCROLL_DURATION_S = MOTION.duration.slow;

function isHeroFullyInViewport(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  return rect.top >= -1 && rect.bottom <= window.innerHeight + 1;
}

export default function HomeHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollingToGallery = useRef(false);
  const lenis = useLenis();
  const buttonOpacity = useMotionValue(1);
  const contentOpacity = useMotionValue(1);
  const backgroundFadeEdge = useMotionValue(0);
  const backgroundMask = useTransform(backgroundFadeEdge, (fadePct) => {
    if (fadePct <= 0) return "none";
    if (fadePct >= 100) {
      return "linear-gradient(to top, transparent 0%, transparent 100%)";
    }
    return `linear-gradient(to top, transparent 0%, transparent ${fadePct}%, black ${fadePct}%, black 100%)`;
  });
  const buttonPointerEvents = useTransform(buttonOpacity, (value) =>
    value > 0.05 ? "auto" : "none",
  );

  const updateOpacity = useCallback(() => {
    const hero = sectionRef.current;
    if (!hero) return;

    const heroHeight = hero.offsetHeight;
    const scrollY = lenis?.scroll ?? window.scrollY;
    const progress = heroHeight > 0 ? Math.min(1, scrollY / (heroHeight * 0.65)) : 0;

    const btnOp = Math.max(0, 1 - progress / 0.22);
    const contentOp = Math.max(0, 1 - Math.max(0, progress - 0.08) / 0.5);

    buttonOpacity.set(isHeroFullyInViewport(hero) ? btnOp : 0);
    contentOpacity.set(contentOp);

    // Background wipes out from the bottom (button) upward over the first half of exit.
    const bgFade = Math.min(1, progress / 0.5);
    backgroundFadeEdge.set(bgFade * 100);
    document.documentElement.dataset.heroBgVisible = bgFade < 1 ? "true" : "false";
  }, [backgroundFadeEdge, buttonOpacity, contentOpacity, lenis]);

  const scrollToGallery = useCallback(() => {
    const target = document.getElementById(HOME_GALLERY_FADE_ANCHOR_ID);
    if (!target || scrollingToGallery.current) return;

    scrollingToGallery.current = true;
    const release = () => {
      scrollingToGallery.current = false;
    };

    if (lenis) {
      lenis.scrollTo(target, {
        offset: 0,
        duration: GALLERY_SCROLL_DURATION_S,
        easing: (t) => {
          const u = t - 1;
          return u * u * u + 1;
        },
        onComplete: release,
      });
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(release, GALLERY_SCROLL_DURATION_S * 1000);
  }, [lenis]);

  useEffect(() => {
    updateOpacity();

    const onScroll = () => updateOpacity();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    lenis?.on("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      lenis?.off("scroll", onScroll);
      delete document.documentElement.dataset.heroBgVisible;
    };
  }, [lenis, updateOpacity]);

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      const hero = sectionRef.current;
      if (!hero || !isHeroFullyInViewport(hero)) return;
      if (event.deltaY <= 0) return;
      if ((lenis?.scroll ?? window.scrollY) > 8) return;
      if (scrollingToGallery.current) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      scrollToGallery();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [lenis, scrollToGallery]);

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
          <div className="col-span-2 col-start-2 flex flex-col items-start md:col-start-2 lg:col-start-2">
            <span className="site-header-brand bg-black px-[2px] py-0 text-heading">
              Daniel Derro
            </span>
            <span className="site-header-brand bg-black px-[2px] py-0 text-heading">
              No School Studios
            </span>
          </div>

          <div className="col-span-1 col-start-2 mt-5 flex min-w-0 flex-col items-start gap-5 text-left md:col-start-2 lg:col-start-2">
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
              style={{
                objectFit: "contain",
                borderColor: "var(--color-white)",
              }}
            />
            {HERO_LOGOS.map((logo) => (
              <img
                key={logo.src}
                src={logo.src}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                className="box-border block h-[32px] w-auto shrink-0 border-[0.5px] object-contain"
                style={{
                  objectFit: "contain",
                  borderColor: "var(--color-white)",
                }}
              />
            ))}
          </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute right-0 bottom-0 left-0 z-[2] box-border px-[var(--spacing-margin)]"
        style={{
          opacity: buttonOpacity,
          pointerEvents: buttonPointerEvents,
          paddingBottom: "calc(var(--spacing-margin) + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="page-grid w-full">
          <div className="col-span-1 col-start-2 flex justify-start md:col-start-2 lg:col-start-2">
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
