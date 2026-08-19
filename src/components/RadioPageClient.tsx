"use client";

import { useState } from "react";
import RadioPlayer from "@/components/RadioPlayer";
import SitePageFooter from "@/components/SitePageFooter";
import { RADIO_INTRO_IMAGES, type RadioEpisode } from "@/lib/site-content";

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
  const [selectedId, setSelectedId] = useState(() => episodes.at(-1)?.id ?? "");
  const selected = episodes.find((episode) => episode.id === selectedId);
  const playerVisible = Boolean(selected?.streamSrc);

  return (
    <main
      className="radio-page min-h-dvh bg-black"
      data-player-visible={playerVisible || undefined}
    >
      <div
        className="layout-full site-page-content-offset radio-page-content"
      >
        <div className="layout-grid items-start">
          <section className="radio-center" aria-label="Radio">
            <header className="radio-intro text-left">
              <div className="radio-intro-images">
                {RADIO_INTRO_IMAGES.map((image) => (
                  <img
                    key={image.src}
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    className="radio-intro-image"
                  />
                ))}
              </div>
              <p className="radio-library-intro-description text-caption radio-library-intro-muted m-0">
                {intro.description}
              </p>
            </header>

            <div className="radio-episodes" aria-label="Episodes">
              <ol className="radio-episode-list">
                {episodes.map((episode, index) => {
                  const isActive = episode.id === selectedId;
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
                          <span className="text-small radio-episode-row-muted">
                            {formatEpisodeNumber(index)}
                          </span>
                          <div className="radio-episode-row-text-stack">
                            <span className="text-small radio-episode-row-title block">
                              {episode.title}
                            </span>
                            {episode.durationLabel ? (
                              <span className="text-small radio-episode-row-muted block">
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
            </div>
          </section>

          {selected ? (
            <aside
              className="radio-tracklist-panel"
              aria-live="polite"
              aria-label="Tracklist"
            >
              <div className="radio-tracklist-box">
                <p className="radio-tracklist-header m-0">
                  <span className="text-small radio-tracklist-header-label">IC</span>
                  <span className="text-small radio-tracklist-header-label">Tracklist</span>
                </p>
                <ol className="radio-tracklist m-0 list-none p-0">
                  {selected.tracklist.map((track, index) => (
                    <li key={`${track.artist}-${track.title}`} className="radio-tracklist-item">
                      <span className="text-small radio-tracklist-number">
                        {formatTrackNumber(index)}
                      </span>
                      <div className="radio-tracklist-copy">
                        <span className="text-small radio-tracklist-title">{track.title}</span>
                        <span className="text-small radio-tracklist-artist">{track.artist}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          ) : null}
        </div>

        <SitePageFooter />
      </div>

      {playerVisible && selected?.streamSrc ? (
        <div className="radio-fixed-player" data-visible>
          <div className="radio-fixed-player-grid layout-grid">
            <div className="radio-fixed-player-slot radio-center-columns">
              <div className="radio-fixed-player-fill" aria-hidden>
                <img
                  src="/images/daniel-hero-new.jpg"
                  alt=""
                  className="radio-fixed-player-fill-image"
                  decoding="async"
                />
                <div className="hero-grain" />
              </div>
              <RadioPlayer src={selected.streamSrc} />
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
