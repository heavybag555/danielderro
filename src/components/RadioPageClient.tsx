"use client";

import { useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import RadioPlayer from "@/components/RadioPlayer";
import RadioTracklistDropdown from "@/components/RadioTracklistDropdown";
import { MOTION } from "@/lib/motion";
import { RADIO_INTRO_IMAGES, type RadioEpisode } from "@/lib/site-content";
import { useMediaQuery } from "@/lib/use-media-query";

export type RadioEpisodeWithStream = RadioEpisode & {
  streamSrc?: string;
};

/** Query param carrying the selected episode, e.g. `/radio?ep=…`. */
const RADIO_EPISODE_PARAM = "ep";

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

function EpisodeCell({
  episode,
  selected,
  playing,
  onSelect,
  variants,
  typeClass,
}: {
  episode: RadioEpisodeWithStream;
  selected: boolean;
  playing: boolean;
  onSelect: () => void;
  variants?: Variants;
  typeClass: string;
}) {
  const status = playing ? "Pause" : "Play";

  return (
    <motion.li variants={variants} className="radio-episode">
      <button
        type="button"
        className="radio-episode-row"
        data-active={selected || undefined}
        aria-current={selected ? "true" : undefined}
        aria-label={`${episode.title}, ${status}`}
        onClick={onSelect}
      >
        <span className="radio-episode-copy">
          <span className={`${typeClass} radio-episode-headline`}>
            <span className="radio-episode-title">{episode.title}</span>
            {episode.durationLabel ? (
              <>
                <span className="radio-episode-slash" aria-hidden="true">
                  {" / "}
                </span>
                <span className="radio-episode-runtime">{episode.durationLabel}</span>
              </>
            ) : null}
          </span>
          <span className={`${typeClass} radio-episode-status`}>
            <span className="radio-episode-play-label" data-on={playing ? "false" : "true"}>
              Play
            </span>
            <span className="radio-episode-now" data-on={playing ? "true" : "false"}>
              Pause
            </span>
          </span>
        </span>
      </button>
    </motion.li>
  );
}

export default function RadioPageClient({ episodes }: RadioPageClientProps) {
  const reduceMotion = useReducedMotion();
  const stagger = !reduceMotion;
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const latest = episodes.at(-1);
  const ordered = [...episodes].reverse();

  // The chosen episode lives in the URL (`/radio?ep=…`) so a specific show can
  // be shared. An unknown or missing id falls back to the newest episode.
  const requestedId = searchParams.get(RADIO_EPISODE_PARAM);
  const selectedId =
    episodes.find((episode) => episode.id === requestedId)?.id ??
    latest?.id ??
    "";

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
    const next = new URLSearchParams(searchParams.toString());
    next.set(RADIO_EPISODE_PARAM, id);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <main
      id="main-content"
      className="radio-page"
      data-player-visible={playerVisible || undefined}
    >
      <h1 className="visually-hidden">Radio</h1>

      <div className="layout-full site-page-content-offset site-page-bottom-padding radio-page-content">
        <div className="layout-grid radio-page-grid">
          <motion.section
            className="radio-episodes"
            aria-label="Episodes"
            variants={stagger ? LIST_VARIANTS : undefined}
            initial={stagger ? "hidden" : false}
            animate={stagger ? "show" : undefined}
          >
            <motion.div
              className="radio-featured-image"
              variants={stagger ? CELL_VARIANTS : undefined}
            >
              <Image
                src={RADIO_MAIN_IMAGE.src}
                alt={RADIO_MAIN_IMAGE.alt}
                width={RADIO_MAIN_IMAGE.width}
                height={RADIO_MAIN_IMAGE.height}
                sizes="(max-width: 767px) 100vw, 50vw"
                quality={90}
                priority
                className="radio-intro-image"
              />
            </motion.div>
            <motion.ol className="radio-gallery" aria-label="Episodes">
              {ordered.map((episode) => (
                <EpisodeCell
                  key={episode.id}
                  episode={episode}
                  selected={episode.id === selectedId}
                  playing={episode.id === selectedId && isPlaying}
                  onSelect={() => selectEpisode(episode.id)}
                  variants={stagger ? CELL_VARIANTS : undefined}
                  typeClass={isDesktop ? "text-fine" : "text-body"}
                />
              ))}
            </motion.ol>
          </motion.section>

          <motion.section
            className="radio-featured"
            aria-label="Latest episode"
            variants={stagger ? LIST_VARIANTS : undefined}
            initial={stagger ? "hidden" : false}
            animate={stagger ? "show" : undefined}
          >
            <motion.div
              className="radio-featured-tracklist"
              variants={stagger ? CELL_VARIANTS : undefined}
            >
              {/* `popLayout` rather than `wait`: the outgoing tracklist leaves
                  layout immediately so a second episode click lands right away
                  instead of queueing behind the exit fade. */}
              <AnimatePresence mode="popLayout" initial={false}>
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
