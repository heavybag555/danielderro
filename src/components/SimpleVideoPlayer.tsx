"use client";

import { useEffect, useRef } from "react";
import { hasRecentUnmutedAutoplay } from "@/lib/autoplay-sound";

type SimplePlayerElement = HTMLElement & {
  autoplayEnabled: boolean;
  pauseOnOverlayClick: boolean;
  controlsEnabled: boolean;
  timeVisible: boolean;
  volumeEnabled: boolean;
};

type SimpleVideoPlayerProps = {
  src: string;
  aspectRatio?: string;
  className?: string;
};

function videoEl(host: HTMLElement): HTMLVideoElement | null {
  return host.shadowRoot?.querySelector("video") ?? null;
}

function unmute(video: HTMLVideoElement) {
  video.muted = false;
  video.defaultMuted = false;
  video.removeAttribute("muted");
  if (video.volume === 0) video.volume = 1;
}

/** Scrubber / tray only — the center play icon should toggle like the video. */
function isPlayerChrome(event: Event): boolean {
  return event.composedPath().some((node) => {
    if (!(node instanceof Element)) return false;
    return (
      node.hasAttribute("data-sp-progress-track") ||
      node.hasAttribute("data-sp-control-tray") ||
      node.hasAttribute("data-sp-volume-control") ||
      node.hasAttribute("data-sp-volume-track") ||
      node.hasAttribute("data-sp-picture-in-picture-control") ||
      node.hasAttribute("data-sp-fullscreen-control") ||
      node.hasAttribute("data-sp-tray-time-text")
    );
  });
}

/** Custom SimplePlayer web component — no stock browser/Vimeo embed chrome. */
export default function SimpleVideoPlayer({
  src,
  aspectRatio = "16 / 9",
  className,
}: SimpleVideoPlayerProps) {
  const ref = useRef<SimplePlayerElement | null>(null);

  useEffect(() => {
    void import("@grizzshutsdown/simpleplayer");
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.autoplayEnabled = false;
    el.pauseOnOverlayClick = false;
    el.controlsEnabled = true;
    el.timeVisible = true;
    el.volumeEnabled = true;

    const applyUnmute = () => {
      const video = videoEl(el);
      if (video) unmute(video);
    };

    applyUnmute();

    let cancelled = false;
    let readyTimer = 0;
    let allowUserMute = false;
    const fromProjectClick = hasRecentUnmutedAutoplay();

    const startPlayback = () => {
      const video = videoEl(el);
      if (!video || cancelled) return;
      if (video.dataset.src && !video.getAttribute("src")) {
        video.src = video.dataset.src;
      }
      unmute(video);
      void video.play();
    };

    const onVolumeChange = () => {
      if (allowUserMute) return;
      const video = videoEl(el);
      if (!video?.muted) return;
      unmute(video);
      if (video.paused) startPlayback();
    };

    const attachReady = (): boolean => {
      const video = videoEl(el);
      if (!video) return false;
      video.playsInline = true;
      video.addEventListener("loadedmetadata", applyUnmute);
      video.addEventListener("canplay", startPlayback);
      video.addEventListener("playing", applyUnmute);
      video.addEventListener("volumechange", onVolumeChange);
      startPlayback();
      return true;
    };

    if (!attachReady()) {
      readyTimer = window.setInterval(() => {
        if (attachReady()) window.clearInterval(readyTimer);
      }, 50);
    }

    const muteGuard = window.setTimeout(() => {
      allowUserMute = true;
    }, 2500);

    // Capture so the center icon does not also fire SimplePlayer's delayed
    // play(), which would toggle twice and cancel the click.
    const onClick = (event: Event) => {
      if (isPlayerChrome(event)) return;
      const video = videoEl(el);
      if (!video) return;
      event.stopPropagation();
      unmute(video);
      if (video.paused || video.ended) void video.play();
      else video.pause();
    };

    el.addEventListener("click", onClick, true);
    if (fromProjectClick) startPlayback();

    return () => {
      cancelled = true;
      window.clearInterval(readyTimer);
      window.clearTimeout(muteGuard);
      el.removeEventListener("click", onClick, true);
      el.removeEventListener("volumechange", onVolumeChange, true);
      const video = videoEl(el);
      video?.removeEventListener("loadedmetadata", applyUnmute);
      video?.removeEventListener("canplay", startPlayback);
      video?.removeEventListener("playing", applyUnmute);
      video?.removeEventListener("volumechange", onVolumeChange);
    };
  }, [src]);

  return (
    <simple-player
      ref={ref}
      className={className}
      src={src}
      aspect-ratio={aspectRatio}
      controls=""
      show-time=""
      disable-autoplay=""
      style={{ display: "block", width: "100%" }}
    />
  );
}
