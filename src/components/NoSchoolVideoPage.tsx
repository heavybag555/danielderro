"use client";

import Image from "next/image";
import SiteFooter from "@/components/SiteFooter";
import SimpleVideoPlayer from "@/components/SimpleVideoPlayer";
import { formatSanityTag } from "@/lib/format-sanity-tag";
import {
  noSchoolAspectRatio,
  type NoSchoolVideo,
} from "@/lib/no-school-videos";

const PROJECT_IMAGE_PAD_Y = 200;

type NoSchoolVideoPageProps = {
  video: NoSchoolVideo;
  playbackSrc: string | null;
};

export default function NoSchoolVideoPage({
  video,
  playbackSrc,
}: NoSchoolVideoPageProps) {
  const aspectRatio = noSchoolAspectRatio(video);

  return (
    <div
      data-work-surface
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--color-black)",
        overflow: "hidden",
      }}
    >
      <div
        className="project-scroll"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <section
          className="project-scroll-slide layout-full"
          style={{
            height: "100dvh",
            boxSizing: "border-box",
            paddingTop: PROJECT_IMAGE_PAD_Y,
            paddingBottom: PROJECT_IMAGE_PAD_Y,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="project-video-frame" style={{ aspectRatio }}>
            {playbackSrc ? (
              <SimpleVideoPlayer src={playbackSrc} aspectRatio={aspectRatio} />
            ) : (
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                sizes="(max-width: 800px) 100vw, 800px"
                quality={85}
                style={{ objectFit: "contain" }}
                priority
              />
            )}
          </div>
        </section>
      </div>

      <SiteFooter
        activePath="/work"
        leftContent={
          <span className="text-body" style={{ color: "var(--color-black)" }}>
            {video.title}
          </span>
        }
        middleContent={
          <span className="text-small" style={{ color: "var(--color-primary)" }}>
            {formatSanityTag("no-school-studio")}
          </span>
        }
        rightContent={
          <span
            className="text-small"
            style={{ display: "flex", gap: 4, fontVariantNumeric: "tabular-nums" }}
          >
            <span className="text-small" style={{ color: "var(--color-black)", opacity: 0.5 }}>
              01
            </span>
            <span className="text-small" style={{ color: "var(--color-black)" }}>
              01
            </span>
          </span>
        }
      />
    </div>
  );
}
