"use client";

import { useEffect } from "react";

type SimpleVideoPlayerProps = {
  src: string;
  aspectRatio?: string;
  className?: string;
};

/** Custom SimplePlayer web component — no stock browser/Vimeo embed chrome. */
export default function SimpleVideoPlayer({
  src,
  aspectRatio = "16 / 9",
  className,
}: SimpleVideoPlayerProps) {
  useEffect(() => {
    void import("@grizzshutsdown/simpleplayer");
  }, []);

  return (
    <simple-player
      className={className}
      src={src}
      aspect-ratio={aspectRatio}
      controls
      pause-on-overlay-click
      show-time
      style={{ display: "block", width: "100%", maxHeight: "100%" }}
    />
  );
}
