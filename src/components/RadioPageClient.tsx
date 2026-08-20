"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import RadioPlayer from "@/components/RadioPlayer";
import RadioTracklistDropdown from "@/components/RadioTracklistDropdown";
import { MOTION } from "@/lib/motion";
import { RADIO_INTRO_IMAGES, type RadioEpisode } from "@/lib/site-content";
import { useMediaQuery } from "@/lib/use-media-query";

export type RadioEpisodeWithStream = RadioEpisode & {
  streamSrc?: string;
};

type RadioPageClientProps = {
  episodes: RadioEpisodeWithStream[];
};

const LIST_VARIANTS: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.08 } },
};

const CELL_VARIANTS: Variants = {
  hidden: { opacity: 0, filter: "blur(6px)" },
  show: {
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: MOTION.ease.heavy },
  },
};

const RADIO_MAIN_IMAGE = RADIO_INTRO_IMAGES[1];

function formatEpisodeNumber(id: string): string {
  return id.replace(/\D/g, "").padStart(3, "0");
}

function EpisodeCell({
  episode,
  selected,
  playing,
  onSelect,
  variants,
}: {
  episode: RadioEpisodeWithStream;
  selected: boolean;
  playing: boolean;
  onSelect: () => void;
  variants?: Variants;
}) {
  const status = playing ? "Pause" : "Play";

  return (
    <motion.li
      variants={variants}
      className="radio-episode"
      style={{ listStyle: "none" }}
    >
      <button
        type="button"
        className="radio-episode-card"
        data-active={selected || undefined}
        aria-current={selected ? "true" : undefined}
        aria-label={`${episode.title}, ${status}`}
        onClick={onSelect}
      >
        <span className="text-small radio-episode-index">
          {formatEpisodeNumber(episode.id)}
          <span aria-hidden="true"> / </span>
          <span className="radio-episode-status">
            <span className="radio-episode-play-label" data-on={playing ? "false" : "true"}>
              Play
            </span>
            <span className="radio-episode-now" data-on={playing ? "true" : "false"}>
              Pause
            </span>
          </span>
        </span>
        <span className="radio-episode-meta">
          <span className="text-small radio-episode-title">{episode.title}</span>
          {episode.durationLabel ? (
            <span className="text-small radio-episode-runtime">
              {episode.durationLabel}
            </span>
          ) : null}
        </span>
      </button>
    </motion.li>
  );
}

export default function RadioPageClient({ episodes }: RadioPageClientProps) {
  const reduceMotion = useReducedMotion();
  const stagger = !reduceMotion;
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const latest = episodes.at(-1);
  const ordered = [...episodes].reverse();
  const [selectedId, setSelectedId] = useState(() => latest?.id ?? "");
  const [playNonce, setPlayNonce] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tracklistOpen, setTracklistOpen] = useState(false);

  const selected = ordered.find((episode) => episode.id === selectedId);
  const playerVisible = Boolean(selected?.streamSrc);

  const selectEpisode = (id: string) => {
    if (id === selectedId) {
      setPlayNonce((value) => value + 1);
      return;
    }
    setIsPlaying(false);
    setSelectedId(id);
  };

  return (
    <main
      className="radio-page"
      data-player-visible={playerVisible || undefined}
    >
      <div className="layout-full site-page-content-offset site-page-bottom-padding radio-page-content">
        <div className="layout-grid radio-page-grid">
          <motion.section
            className="radio-featured"
            aria-label="Latest episode"
            variants={stagger ? LIST_VARIANTS : undefined}
            initial={stagger ? "hidden" : false}
            animate={stagger ? "show" : undefined}
          >
            <motion.div variants={stagger ? CELL_VARIANTS : undefined} className="radio-featured-image">
              <Image
                src={RADIO_MAIN_IMAGE.src}
                alt={RADIO_MAIN_IMAGE.alt}
                width={RADIO_MAIN_IMAGE.width}
                height={RADIO_MAIN_IMAGE.height}
                className="radio-intro-image"
              />
            </motion.div>

            <motion.div
              className="radio-featured-tracklist"
              variants={stagger ? CELL_VARIANTS : undefined}
            >
              <AnimatePresence mode="wait" initial={false}>
                {selected ? (
                  <motion.div
                    key={selected.id}
                    initial={stagger ? { opacity: 0, filter: "blur(4px)" } : false}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{
                      opacity: 0,
                      filter: "blur(4px)",
                      transition: {
                        duration: stagger ? 0.35 : 0,
                        ease: MOTION.ease.heavy,
                      },
                    }}
                    transition={{
                      duration: stagger ? 0.6 : 0,
                      ease: MOTION.ease.heavy,
                    }}
                  >
                    <RadioTracklistDropdown
                      id={`radio-tracklist-featured-${selected.id}`}
                      open={isDesktop || tracklistOpen}
                      alwaysOpen={isDesktop}
                      episodeTitle={selected.title}
                      tracks={selected.tracklist}
                      onToggle={() => setTracklistOpen((open) => !open)}
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          </motion.section>

          <motion.ol
            className="radio-gallery"
            variants={stagger ? LIST_VARIANTS : undefined}
            initial={stagger ? "hidden" : false}
            animate={stagger ? "show" : undefined}
            aria-label="Episodes"
          >
            {ordered.map((episode) => (
              <EpisodeCell
                key={episode.id}
                episode={episode}
                selected={episode.id === selectedId}
                playing={episode.id === selectedId && isPlaying}
                onSelect={() => selectEpisode(episode.id)}
                variants={stagger ? CELL_VARIANTS : undefined}
              />
            ))}
          </motion.ol>
        </div>
      </div>

      {playerVisible && selected?.streamSrc ? (
        <div className="radio-fixed-player" data-visible>
          <RadioPlayer
            src={selected.streamSrc}
            playNonce={playNonce}
            onPlayingChange={setIsPlaying}
          />
        </div>
      ) : null}
    </main>
  );
}
