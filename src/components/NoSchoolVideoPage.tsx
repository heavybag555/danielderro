"use client";

import Image from "next/image";
import SiteFooter from "@/components/SiteFooter";
import SimpleVideoPlayer from "@/components/SimpleVideoPlayer";
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
    <main
      id="main-content"
      data-work-surface
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--color-black)",
        overflow: "hidden",
      }}
    >
      <h1 className="visually-hidden">{video.title}</h1>

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
          }}
        >
          <div className="layout-grid project-slide-media">
            <div className="project-slide-video">
              <div className="project-video-frame" style={{ aspectRatio }}>
                {playbackSrc ? (
                  <SimpleVideoPlayer src={playbackSrc} aspectRatio={aspectRatio} />
                ) : (
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 25vw"
                    quality={90}
                    style={{ objectFit: "contain" }}
                    priority
                  />
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <SiteFooter
        client="No School Studio"
        title={video.title}
        tags="Motion"
        slide={{ current: 1, total: 1 }}
      />
    </main>
  );
}
