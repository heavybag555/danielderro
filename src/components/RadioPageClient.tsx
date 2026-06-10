"use client";

import { useState } from "react";
import RadioPlayer from "@/components/RadioPlayer";
import SitePageFooter from "@/components/SitePageFooter";
import type { RadioEpisode } from "@/lib/site-content";

export type RadioEpisodeWithStream = RadioEpisode & {
  streamSrc?: string;
};

type RadioPageClientProps = {
  intro: { title: string; description: string };
  episodes: RadioEpisodeWithStream[];
};

function formatEpisodeNumber(index: number): string {
  return String(index + 1).padStart(3, "0");
}

function formatTrackNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}

export default function RadioPageClient({ intro, episodes }: RadioPageClientProps) {
  const [selectedId, setSelectedId] = useState(episodes[0]?.id ?? "");
  const selected = episodes.find((episode) => episode.id === selectedId) ?? episodes[0];

  return (
    <main className="min-h-dvh bg-black">
      <div
        className="pb-[120px] pt-[calc(var(--spacing-margin)+env(safe-area-inset-top,0px))]"
        style={{
          paddingLeft: "var(--spacing-margin)",
          paddingRight: "var(--spacing-margin)",
          boxSizing: "border-box",
        }}
      >
        <div className="page-grid items-start">
          <aside className="radio-library col-span-2 md:col-span-2 lg:col-span-2 lg:col-start-4">
            <div className="radio-library-intro">
              <p className="text-body m-0 text-white">{intro.title}</p>
              <p className="radio-library-intro-description text-micro radio-library-intro-muted m-0">
                {intro.description}
              </p>
            </div>

            <ol className="radio-episode-list">
              {episodes.map((episode, index) => {
                const isActive = episode.id === selected?.id;
                return (
                  <li key={episode.id} className="radio-episode-item">
                    <button
                      type="button"
                      className="radio-episode-row"
                      data-active={isActive || undefined}
                      aria-current={isActive ? "true" : undefined}
                      onClick={() => setSelectedId(episode.id)}
                    >
                      <div className="radio-episode-row-meta">
                        <span className="text-caption radio-episode-row-muted">
                          {formatEpisodeNumber(index)}
                        </span>
                        <div className="radio-episode-row-text-stack">
                          <span className="text-caption radio-episode-row-title block">
                            {episode.title}
                          </span>
                          {episode.durationLabel ? (
                            <span className="text-caption radio-episode-row-muted block">
                              {episode.durationLabel}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ol>
          </aside>

          {selected ? (
            <section
              className="radio-detail col-span-2 md:col-span-2 lg:col-span-3 lg:col-start-6"
              aria-live="polite"
            >
              <figure className="radio-cover">
                <img
                  src={selected.cover.src}
                  alt={selected.cover.alt}
                  width={selected.cover.width}
                  height={selected.cover.height}
                  className="block h-auto w-full max-w-full object-contain"
                />
              </figure>

              {selected.streamSrc ? (
                <div className="radio-player-wrap">
                  <RadioPlayer key={selected.id} src={selected.streamSrc} />
                </div>
              ) : null}

              <ol className="radio-tracklist m-0 list-none p-0">
                {selected.tracklist.map((track, index) => (
                  <li key={`${track.artist}-${track.title}`} className="radio-tracklist-item">
                    <span className="text-caption radio-tracklist-number">
                      {formatTrackNumber(index)}
                    </span>
                    <div className="radio-tracklist-copy">
                      <span className="text-caption radio-tracklist-title">{track.title}</span>
                      <span className="text-caption radio-tracklist-artist">{track.artist}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          <div className="hidden lg:col-span-2 lg:col-start-9 lg:block" aria-hidden />
        </div>

        <SitePageFooter onDark />
      </div>
    </main>
  );
}
