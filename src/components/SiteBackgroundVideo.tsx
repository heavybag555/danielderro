"use client";

import { useEffect, useRef } from "react";
import { preload } from "react-dom";

/** Encoded by `scripts/encode-hero-media.sh` — see that file for the quality bar. */
export const HERO_VIDEO_SRC = "/videos/dd-intro-hero.mp4";
export const HERO_POSTER_SRC = "/images/daniel-hero-poster.webp";

type SiteBackgroundVideoProps = {
  /** Pin the video to the viewport so page content can scroll over it. */
  fixed?: boolean;
  /** Darken the picture so foreground copy stays readable. */
  dimmed?: boolean;
};

export default function SiteBackgroundVideo({
  fixed = false,
  dimmed = false,
}: SiteBackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // The poster is what the visitor actually sees first, so it outranks the loop.
  preload(HERO_POSTER_SRC, { as: "image", fetchPriority: "high" });

  useEffect(() => {
    document.documentElement.dataset.heroBgVisible = "true";

    const video = videoRef.current;
    if (!video) {
      return () => {
        delete document.documentElement.dataset.heroBgVisible;
      };
    }

    video.controls = false;
    video.defaultMuted = true;
    video.muted = true;
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");

    // A decorative muted loop has to stop when the visitor asks for reduced
    // motion; the poster stays as the still fallback. Tracked live so toggling
    // the OS setting takes effect without a reload.
    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => {
      if (reduceQuery.matches) {
        video.pause();
        video.currentTime = 0;
        return;
      }
      void video.play().catch(() => {
        // Autoplay may be blocked until user interaction; muted loop still preferred.
      });
    };

    sync();
    reduceQuery.addEventListener("change", sync);

    return () => {
      reduceQuery.removeEventListener("change", sync);
      delete document.documentElement.dataset.heroBgVisible;
    };
  }, []);

  return (
    <div
      className={[
        "site-background-video",
        fixed ? "site-background-video--fixed" : "",
        dimmed ? "site-background-video--dimmed" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      <video
        ref={videoRef}
        src={HERO_VIDEO_SRC}
        poster={HERO_POSTER_SRC}
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        // The poster carries first paint at full quality; the loop streams in
        // behind it. `auto` pulled the whole file on three separate routes.
        preload="metadata"
        aria-hidden
        controls={false}
      />
    </div>
  );
}
