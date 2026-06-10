"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type RadioPlayerProps = {
  src: string;
};

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const s = total % 60;
  const m = Math.floor(total / 60) % 60;
  const h = Math.floor(total / 3600);
  const ss = String(s).padStart(2, "0");
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${ss}`;
  return `${m}:${ss}`;
}

function PlayIcon() {
  return (
    <svg className="radio-player__icon" viewBox="0 0 18 20" aria-hidden="true">
      <path
        d="M3 3.5L15 10L3 16.5Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg className="radio-player__icon" viewBox="0 0 18 20" aria-hidden="true">
      <rect x="3" y="3" width="5" height="14" rx="1.5" fill="currentColor" />
      <rect x="10" y="3" width="5" height="14" rx="1.5" fill="currentColor" />
    </svg>
  );
}

function VolumeIcon({ muted }: { muted: boolean }) {
  if (muted) {
    return (
      <svg className="radio-player__icon radio-player__icon--control" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M3 17L17 3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M15 16.0773C14.9998 17.6883 13.1207 18.5686 11.8828 17.5372L9.8333 15.8303C9.38114 15.4538 9.35003 14.7702 9.76611 14.3541C10.132 13.9882 10.7165 13.9617 11.114 14.2929L13 15.8644V11.5354C13 11.2702 13.1054 11.0158 13.2929 10.8283C13.9229 10.1983 15 10.6445 15 11.5354V16.0773Z"
          fill="currentColor"
        />
        <path
          d="M12 2.37218C13.2358 1.48685 15 2.36173 15 3.92296V4.87902L13 6.87902V4.13488L8.64062 7.76867C8.46092 7.91841 8.23392 8.00011 8 8.00011H5C4.44768 8.00011 4 8.4478 4 9.00011V11.0001C4.00009 11.5524 4.44774 12.0001 5 12.0001H7.87891L5.87891 14.0001H5C3.34317 14.0001 2.00009 12.6569 2 11.0001V9.00011C2 7.34323 3.34312 6.00011 5 6.00011H7.63672L11.8828 2.463L12 2.37218Z"
          fill="currentColor"
        />
      </svg>
    );
  }
  return (
    <svg className="radio-player__icon radio-player__icon--control" viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M8 7.00002H5C3.8954 7.00002 3 7.89542 3 9.00002V11C3 12.1046 3.8954 13 5 13H8L12.5227 16.7689C13.1093 17.2578 14 16.8406 14 16.077V3.92302C14 3.15942 13.1094 2.74222 12.5227 3.23112L8 7.00002Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.4141 8.58582C18.1951 9.36682 18.1951 10.6332 17.4141 11.4142"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function RadioPlayer({ src }: RadioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const volumeTrackRef = useRef<HTMLDivElement>(null);

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => {
      setDuration(audio.duration);
      setReady(true);
    };
    const onTime = () => setCurrent(audio.currentTime);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    const onVolume = () => {
      setVolume(audio.volume);
      setMuted(audio.muted);
    };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("durationchange", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("playing", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("volumechange", onVolume);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("durationchange", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("playing", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("volumechange", onVolume);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, []);

  const seekToClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      const audio = audioRef.current;
      if (!track || !audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
      const rect = track.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const time = ratio * audio.duration;
      setCurrent(time);
      audio.currentTime = time;
    },
    [],
  );

  const onTrackPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      trackRef.current?.setPointerCapture(event.pointerId);
      setScrubbing(true);
      seekToClientX(event.clientX);
    },
    [seekToClientX],
  );

  const onTrackPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!scrubbing) return;
      seekToClientX(event.clientX);
    },
    [scrubbing, seekToClientX],
  );

  const onTrackPointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!scrubbing) return;
      setScrubbing(false);
      trackRef.current?.releasePointerCapture(event.pointerId);
    },
    [scrubbing],
  );

  const setVolumeFromClientY = useCallback((clientY: number) => {
    const track = volumeTrackRef.current;
    const audio = audioRef.current;
    if (!track || !audio) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, 1 - (clientY - rect.top) / rect.height));
    audio.volume = ratio;
    audio.muted = ratio === 0;
  }, []);

  const onVolumePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      volumeTrackRef.current?.setPointerCapture(event.pointerId);
      setVolumeFromClientY(event.clientY);
      const move = (e: PointerEvent) => setVolumeFromClientY(e.clientY);
      const up = (e: PointerEvent) => {
        volumeTrackRef.current?.releasePointerCapture(e.pointerId);
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [setVolumeFromClientY],
  );

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
  }, []);

  const progress = duration > 0 ? Math.min(1, current / duration) : 0;
  const isMutedView = muted || volume === 0;
  const volumeLevel = isMutedView ? 0 : volume;

  return (
    <div className="radio-player" data-playing={playing} data-ready={ready}>
      {/* preload metadata so duration + seeking work immediately */}
      <audio ref={audioRef} src={src} preload="metadata" />

      <button
        type="button"
        className="radio-player__play"
        onClick={togglePlay}
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>

      <div
        ref={trackRef}
        className="radio-player__track"
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={Math.floor(duration) || 0}
        aria-valuenow={Math.floor(current)}
        onPointerDown={onTrackPointerDown}
        onPointerMove={onTrackPointerMove}
        onPointerUp={onTrackPointerUp}
      >
        <span className="radio-player__rail" aria-hidden="true" />
        <span
          className="radio-player__fill"
          aria-hidden="true"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <span className="radio-player__time">{formatTime(current)}</span>

      <div className="radio-player__volume">
        <button
          type="button"
          className="radio-player__volume-button"
          onClick={toggleMute}
          aria-label={isMutedView ? "Unmute" : "Mute"}
        >
          <VolumeIcon muted={isMutedView} />
        </button>
        <div className="radio-player__volume-pop">
          <div
            ref={volumeTrackRef}
            className="radio-player__volume-track"
            role="slider"
            aria-label="Volume"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(volumeLevel * 100)}
            onPointerDown={onVolumePointerDown}
          >
            <span
              className="radio-player__volume-fill"
              aria-hidden="true"
              style={{ height: `${volumeLevel * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
