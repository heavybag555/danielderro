"use client";

import { useEffect, useRef } from "react";

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

  useEffect(() => {
    document.documentElement.dataset.heroBgVisible = "true";

    const video = videoRef.current;
    if (video) {
      video.controls = false;
      video.defaultMuted = true;
      video.muted = true;
      video.setAttribute("playsinline", "true");
      video.setAttribute("webkit-playsinline", "true");
      void video.play().catch(() => {
        // Autoplay may be blocked until user interaction; muted loop still preferred.
      });
    }

    return () => {
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
        src="/videos/dd-intro-video.mp4"
        poster="/images/daniel-hero-new.jpg"
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        preload="auto"
        aria-hidden
        controls={false}
      />
    </div>
  );
}
