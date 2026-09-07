"use client";

import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { DialRoot, useDialKit } from "dialkit";
import "dialkit/styles.css";
import { motion, useReducedMotion } from "framer-motion";
import { galleryTileImageUrl } from "@/sanity/lib/image";
import { MOTION } from "@/lib/motion";
import { useMediaQuery } from "@/lib/use-media-query";
import { useSmoothScrollEnabled } from "@/lib/use-smooth-scroll";
import {
  dampingAlpha,
  SMOOTH_SCROLL_LERP,
  wheelDeltaPx,
} from "@/lib/smooth-scroll";
import { markUnmutedAutoplay } from "@/lib/autoplay-sound";
import type { GalleryStill } from "@/lib/gallery-stills";
import {
  layoutGalleryBarrel,
  poolCopies,
  projectDomeTile,
  wrapCoord,
  type BarrelLayoutItem,
  type BarrelWorld,
} from "@/lib/gallery-barrel";

const HOVER_HOLD_MS = 450;
const DRAG_CLICK_PX = 6;
/** Extra px around the viewport before a pooled tile is hidden. */
const CULL_MARGIN = 320;
const SHOW_DIALS = process.env.NODE_ENV !== "production";
/** px/frame below this stays sharp; above it maps into the blur range. */
const MOTION_BLUR_DEADZONE = 8;
const MOTION_BLUR_GAIN = 0.12;
const MOTION_BLUR_MAX = 6;

function motionBlurPx(speed: number): number {
  if (speed < MOTION_BLUR_DEADZONE) return 0;
  return Math.min(MOTION_BLUR_MAX, (speed - MOTION_BLUR_DEADZONE) * MOTION_BLUR_GAIN);
}

function motionBlurFilter(loaded: boolean, blurPx: number): string {
  if (!loaded || blurPx < 0.35) return "none";
  return `blur(${blurPx.toFixed(1)}px)`;
}

type TileNode = {
  el: HTMLDivElement;
  media: HTMLElement | null;
  video: HTMLVideoElement | null;
  item: BarrelLayoutItem;
  cj: number;
  ck: number;
};

function tileFullSrc(still: GalleryStill, cssWidth: number): string {
  if (still.remote) return still.src;
  return galleryTileImageUrl(still.src, cssWidth);
}

/** Start the full image/video only once a tile is on screen. Blur is a CSS var. */
function armTile(el: HTMLDivElement, video: HTMLVideoElement | null, blurSrc?: string) {
  if (blurSrc && el.dataset.blurSet !== "true") {
    el.dataset.blurSet = "true";
    const media = el.querySelector<HTMLElement>(".gallery-barrel-media");
    media?.style.setProperty("--gallery-blur", `url("${blurSrc}")`);
  }

  const reveal = () => {
    el.dataset.loaded = "true";
  };

  const full = el.querySelector<HTMLImageElement>("img.gallery-barrel-full");
  const nextImg = full?.dataset.src;
  if (full && nextImg && full.dataset.assignedSrc !== nextImg) {
    const hadSrc = Boolean(full.getAttribute("src"));
    full.dataset.assignedSrc = nextImg;
    if (!hadSrc) {
      full.addEventListener("load", reveal, { once: true });
      full.addEventListener("error", reveal, { once: true });
      full.src = nextImg;
      if (full.complete && full.naturalWidth > 0) reveal();
    } else {
      // Keep the current pixels up while a sharper src decodes — swapping
      // immediately would flash the placeholder on a tile that's already loaded.
      const probe = new Image();
      probe.onload = () => {
        full.src = nextImg;
        reveal();
      };
      probe.onerror = reveal;
      probe.src = nextImg;
    }
  }

  const nextVideo = video?.dataset.src;
  if (video && nextVideo && video.dataset.assignedSrc !== nextVideo) {
    video.dataset.assignedSrc = nextVideo;
    video.addEventListener("loadeddata", reveal, { once: true });
    video.addEventListener("error", reveal, { once: true });
    video.src = nextVideo;
    if (video.readyState >= 2) reveal();
  }
}

/**
 * Fixed pool of tile nodes: every still is mounted once per toroidal copy and
 * never unmounts while panning — the paint loop only moves existing nodes, so
 * images never remount/redecode (the source of the blinking).
 */
const TilePool = memo(function TilePool({
  world,
  copiesX,
  copiesY,
  bind,
  onHover,
  onLeave,
  isDragClick,
}: {
  world: BarrelWorld;
  copiesX: number;
  copiesY: number;
  bind: (
    key: string,
    item: BarrelLayoutItem,
    cj: number,
    ck: number,
  ) => (el: HTMLDivElement | null) => void;
  onHover: (stillKey: string) => void;
  onLeave: () => void;
  isDragClick: () => boolean;
}) {
  const tiles: React.ReactNode[] = [];
  for (const item of world.items) {
    const fullSrc = tileFullSrc(item.still, item.w);
    for (let cj = 0; cj < copiesX; cj += 1) {
      for (let ck = 0; ck < copiesY; ck += 1) {
        const key = `${item.key}@${cj}:${ck}`;
        const primary = cj === 0 && ck === 0;
        tiles.push(
          <div
            key={key}
            ref={bind(key, item, cj, ck)}
            className="gallery-barrel-tile"
            style={{ width: item.w, height: item.h, visibility: "hidden" }}
          >
            <Link
              href={`/work/${item.still.slug}`}
              aria-label={item.still.title}
              className="gallery-barrel-link"
              tabIndex={primary ? undefined : -1}
              draggable={false}
              onPointerDown={markUnmutedAutoplay}
              onPointerEnter={() => onHover(item.still.key)}
              onPointerLeave={onLeave}
              onClick={(event) => {
                if (isDragClick()) event.preventDefault();
              }}
            >
              <span className="gallery-barrel-media">
                {item.still.videoSrc ? (
                  <video
                    data-src={item.still.videoSrc}
                    muted
                    loop
                    playsInline
                    preload="none"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element -- src is armed in the paint loop
                  <img
                    className="gallery-barrel-full"
                    alt=""
                    data-src={fullSrc}
                    decoding="async"
                    draggable={false}
                  />
                )}
              </span>
            </Link>
          </div>,
        );
      }
    }
  }
  return <>{tiles}</>;
});

export default function GalleryIndex({
  stills,
}: {
  stills: GalleryStill[];
}) {
  const reduceMotion = useReducedMotion();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const smoothWheel = useSmoothScrollEnabled();
  const flatten = Boolean(reduceMotion);
  const params = useDialKit(
    "Gallery dome",
    {
      columns: [8, 3, 14, 1],
      tileWidth: [180, 96, 480, 1],
      gap: [40, 8, 80, 1],
      perspective: [2500, 500, 3600, 10],
      bulge: [690, 0, 900, 2],
      spread: [1, 0.15, 1, 0.01],
      curve: [0.23, 0, 2.5, 0.01],
      round: [0, 0, 64, 1],
      inertia: [0.9, 0.82, 0.985, 0.001],
    },
    { id: "gallery-dome-v3", persist: SHOW_DIALS },
  );

  const columns = isMobile ? Math.min(params.columns, 4) : params.columns;
  const tileWidth = isMobile ? 132 : params.tileWidth;
  const world = useMemo(
    () => layoutGalleryBarrel(stills, columns, tileWidth, params.gap),
    [stills, columns, tileWidth, params.gap],
  );
  const [copies, setCopies] = useState({ x: 1, y: 1 });

  const stageRef = useRef<HTMLDivElement>(null);
  const spaceRef = useRef<HTMLDivElement>(null);
  const nodes = useRef(new Map<string, TileNode>());
  const pan = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  /** Desktop wheel/keys steer this; the pan glides toward it each frame. */
  const wheelTarget = useRef({ x: 0, y: 0, active: false });
  const lastTick = useRef(0);
  const lastPan = useRef({ x: 0, y: 0 });
  const speedRef = useRef(0);
  const dragging = useRef(false);
  const dragMoved = useRef(false);
  const pointer = useRef({ id: -1, x: 0, y: 0 });
  const raf = useRef(0);
  const view = useRef({ w: 0, h: 0 });
  const paramsRef = useRef(params);
  const worldRef = useRef(world);
  const flattenRef = useRef(flatten);
  const smoothWheelRef = useRef(smoothWheel);
  paramsRef.current = params;
  worldRef.current = world;
  flattenRef.current = flatten;
  smoothWheelRef.current = smoothWheel;

  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const hoverTimer = useRef<number | null>(null);
  const hoveredStill = stills.find((still) => still.key === hoveredKey) ?? null;
  const [lastHovered, setLastHovered] = useState<GalleryStill | null>(null);
  const meta = hoveredStill ?? lastHovered;

  useEffect(() => {
    if (hoveredStill) setLastHovered(hoveredStill);
  }, [hoveredStill]);

  const [dialsReady, setDialsReady] = useState(false);
  const [clientReady, setClientReady] = useState(false);
  useEffect(() => {
    setDialsReady(true);
    setClientReady(true);
  }, []);

  const clearHoverTimer = useCallback(() => {
    if (hoverTimer.current !== null) {
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  }, []);

  const requestHover = useCallback(
    (key: string | null) => {
      if (isMobile || dragging.current) return;
      clearHoverTimer();
      if (!key) {
        setHoveredKey(null);
        return;
      }
      hoverTimer.current = window.setTimeout(() => {
        setHoveredKey(key);
      }, HOVER_HOLD_MS);
    },
    [isMobile, clearHoverTimer],
  );

  const onTileHover = useCallback(
    (stillKey: string) => requestHover(stillKey),
    [requestHover],
  );
  const onTileLeave = useCallback(() => requestHover(null), [requestHover]);
  const isDragClick = useCallback(() => dragMoved.current, []);

  useEffect(() => clearHoverTimer, [clearHoverTimer]);

  // Hover dim writes straight to the pooled nodes — no React pass over tiles.
  useEffect(() => {
    nodes.current.forEach(({ el, item }) => {
      if (hoveredKey !== null && item.still.key !== hoveredKey) {
        el.dataset.dimmed = "true";
      } else {
        delete el.dataset.dimmed;
      }
    });
  }, [hoveredKey]);

  const bindTile = useCallback(
    (key: string, item: BarrelLayoutItem, cj: number, ck: number) =>
      (el: HTMLDivElement | null) => {
        if (el) {
          nodes.current.set(key, {
            el,
            media: el.querySelector(".gallery-barrel-media"),
            video: el.querySelector("video"),
            item,
            cj,
            ck,
          });
        } else {
          nodes.current.delete(key);
        }
      },
    [],
  );

  const measure = useCallback(() => {
    const node = stageRef.current;
    if (!node) return;
    view.current.w = node.clientWidth;
    view.current.h = node.clientHeight;
  }, []);

  const syncCopies = useCallback(() => {
    const next = poolCopies(worldRef.current, view.current.w, view.current.h);
    setCopies((prev) =>
      prev.x === next.x && prev.y === next.y ? prev : next,
    );
  }, []);

  /** Position every pooled node for the current pan. Pure DOM writes. */
  const paint = useCallback(() => {
    const p = paramsRef.current;
    const worldNow = worldRef.current;
    const { w: vw, h: vh } = view.current;
    const flat = flattenRef.current;
    const optics = {
      bulge: p.bulge,
      spread: p.spread,
      curve: p.curve,
      round: p.round,
    };
    const W = worldNow.width;
    const panX = pan.current.x;
    const panY = pan.current.y;
    const blurPx = flat ? 0 : motionBlurPx(speedRef.current);

    nodes.current.forEach(({ el, media, video, item, cj, ck }) => {
      const P = item.periodY;
      const sx0 = W > 0 ? wrapCoord(item.x - panX, W) : item.x - panX;
      const sy0 = P > 0 ? wrapCoord(item.y - panY, P) : item.y - panY;
      const sx = sx0 + (cj - 1) * W;
      const sy = sy0 + (ck - 1) * P;

      if (
        sx + item.w < -CULL_MARGIN ||
        sx > vw + CULL_MARGIN ||
        sy + item.h < -CULL_MARGIN ||
        sy > vh + CULL_MARGIN
      ) {
        if (el.style.visibility !== "hidden") {
          el.style.visibility = "hidden";
          if (media && media.style.filter !== "none") media.style.filter = "none";
          if (video && !video.paused) video.pause();
        }
        return;
      }

      armTile(el, video, item.still.blurSrc);

      const t = projectDomeTile(sx, sy, item.w, item.h, vw, vh, optics, flat);
      el.style.visibility = "visible";
      el.style.transform = `translate3d(${t.x}px, ${t.y}px, ${t.z}px) rotateX(${t.rotateX}deg) rotateY(${t.rotateY}deg)`;
      el.style.borderRadius = `${t.radius}px`;
      const filter = motionBlurFilter(el.dataset.loaded === "true", blurPx);
      if (media && media.style.filter !== filter) media.style.filter = filter;

      if (video) {
        // Decorative loops stop under prefers-reduced-motion.
        if (flat) {
          if (!video.paused) video.pause();
        } else if (video.paused) {
          video.play().catch(() => {});
        }
      }
    });
  }, []);

  const wrapPan = useCallback(() => {
    // X wraps at the shared period; Y wraps per column inside paint, so panY
    // stays unbounded (pixel floats are exact far beyond any session's travel).
    const worldNow = worldRef.current;
    if (worldNow.width > 0) {
      const wrapped = wrapCoord(pan.current.x, worldNow.width);
      // Shift the wheel target by the same period so the glide is unaffected.
      wheelTarget.current.x += wrapped - pan.current.x;
      pan.current.x = wrapped;
    }
  }, []);

  /** Steer the dome from wheel / keys: damped on desktop, direct otherwise. */
  const nudge = useCallback((dx: number, dy: number) => {
    pan.current.vx = 0;
    pan.current.vy = 0;
    if (!smoothWheelRef.current || flattenRef.current) {
      wheelTarget.current.active = false;
      pan.current.x += dx;
      pan.current.y += dy;
      return;
    }
    const target = wheelTarget.current;
    if (!target.active) {
      target.x = pan.current.x;
      target.y = pan.current.y;
      target.active = true;
    }
    target.x += dx;
    target.y += dy;
  }, []);

  const tick = useCallback((now: number) => {
    raf.current = 0;
    const dt = Math.min((now - lastTick.current) / 1000, 0.1);
    lastTick.current = now;

    if (!dragging.current) {
      const target = wheelTarget.current;
      if (target.active) {
        const alpha = dampingAlpha(SMOOTH_SCROLL_LERP, dt);
        const remainingX = target.x - pan.current.x;
        const remainingY = target.y - pan.current.y;
        if (Math.hypot(remainingX, remainingY) < 0.3) {
          pan.current.x = target.x;
          pan.current.y = target.y;
          target.active = false;
        } else {
          pan.current.x += remainingX * alpha;
          pan.current.y += remainingY * alpha;
        }
      } else {
        pan.current.x += pan.current.vx;
        pan.current.y += pan.current.vy;
        const damp = paramsRef.current.inertia;
        pan.current.vx *= damp;
        pan.current.vy *= damp;
        if (Math.abs(pan.current.vx) < 0.04) pan.current.vx = 0;
        if (Math.abs(pan.current.vy) < 0.04) pan.current.vy = 0;
      }
    }

    // Measure before wrap — wrapping X by a world period would look like a
    // huge jump and spike the blur.
    const instant = Math.hypot(
      pan.current.x - lastPan.current.x,
      pan.current.y - lastPan.current.y,
    );
    wrapPan();
    lastPan.current.x = pan.current.x;
    lastPan.current.y = pan.current.y;

    speedRef.current = flattenRef.current
      ? 0
      : speedRef.current * 0.72 + instant * 0.28;
    if (speedRef.current < 0.15) speedRef.current = 0;

    paint();

    const coasting =
      !dragging.current &&
      (pan.current.vx !== 0 ||
        pan.current.vy !== 0 ||
        wheelTarget.current.active);
    if (dragging.current || coasting || speedRef.current > 0) {
      raf.current = window.requestAnimationFrame(tick);
    }
  }, [paint, wrapPan]);

  const startLoop = useCallback(() => {
    if (raf.current) return;
    lastTick.current = performance.now();
    raf.current = window.requestAnimationFrame(tick);
  }, [tick]);

  // Re-measure, size the pool, and repaint whenever layout inputs change.
  // Reveal only after the client breakpoint and copy pool have settled, with
  // the dome already written — the veil then fades over a live 3D scene.
  useLayoutEffect(() => {
    measure();
    const next = poolCopies(worldRef.current, view.current.w, view.current.h);
    if (copies.x !== next.x || copies.y !== next.y) {
      setCopies(next);
      paint();
      return;
    }
    paint();
    const stage = stageRef.current;
    if (
      clientReady &&
      stage &&
      view.current.w > 0 &&
      view.current.h > 0
    ) {
      stage.dataset.ready = "true";
    }
  }, [measure, paint, world, copies, params, flatten, clientReady]);

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const observer = new ResizeObserver(() => {
      measure();
      syncCopies();
      paint();
    });
    observer.observe(node);

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      event.preventDefault();
      const { dx, dy } = wheelDeltaPx(event);
      nudge(dx, dy);
      startLoop();
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      observer.disconnect();
      node.removeEventListener("wheel", onWheel);
    };
  }, [measure, syncCopies, paint, startLoop, nudge]);

  useEffect(
    () => () => {
      if (raf.current) window.cancelAnimationFrame(raf.current);
    },
    [],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    dragMoved.current = false;
    dragging.current = false;
    pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    pan.current.vx = 0;
    pan.current.vy = 0;
    // The hand takes over from any wheel glide still in flight.
    wheelTarget.current.active = false;
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== pointer.current.id) return;
    const dx = event.clientX - pointer.current.x;
    const dy = event.clientY - pointer.current.y;
    if (!dragging.current) {
      if (Math.hypot(dx, dy) <= DRAG_CLICK_PX) return;
      dragging.current = true;
      dragMoved.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.dataset.dragging = "true";
      clearHoverTimer();
      setHoveredKey(null);
      startLoop();
    }
    pan.current.x -= dx;
    pan.current.y -= dy;
    pan.current.vx = -dx;
    pan.current.vy = -dy;
    pointer.current.x = event.clientX;
    pointer.current.y = event.clientY;
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== pointer.current.id) return;
    const wasDragging = dragging.current;
    dragging.current = false;
    pointer.current.id = -1;
    event.currentTarget.dataset.dragging = "false";
    if (wasDragging && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (flattenRef.current) {
      pan.current.vx = 0;
      pan.current.vy = 0;
    }
    if (pan.current.vx !== 0 || pan.current.vy !== 0 || speedRef.current > 0) {
      startLoop();
    } else {
      wrapPan();
      lastPan.current.x = pan.current.x;
      lastPan.current.y = pan.current.y;
      paint();
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = 72;
    if (event.key === "ArrowLeft") nudge(-step, 0);
    else if (event.key === "ArrowRight") nudge(step, 0);
    else if (event.key === "ArrowUp") nudge(0, -step);
    else if (event.key === "ArrowDown") nudge(0, step);
    else return;
    event.preventDefault();
    startLoop();
  };

  return (
    <main id="main-content" className="gallery-page-shell" data-gallery-canvas>
      <h1 className="visually-hidden">Gallery</h1>
      {SHOW_DIALS && dialsReady ? <DialRoot /> : null}

      <div
        ref={stageRef}
        className="gallery-barrel"
        style={{ perspective: flatten ? undefined : `${params.perspective}px` }}
        tabIndex={0}
        aria-label="Infinite gallery canvas. Drag, scroll, or use arrow keys to pan."
        data-dragging="false"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        onMouseLeave={onTileLeave}
      >
        <div ref={spaceRef} className="gallery-barrel-space">
          <TilePool
            world={world}
            copiesX={copies.x}
            copiesY={copies.y}
            bind={bindTile}
            onHover={onTileHover}
            onLeave={onTileLeave}
            isDragClick={isDragClick}
          />
        </div>
      </div>

      <motion.div
        className="gallery-hover-meta blend-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: hoveredStill ? 1 : 0 }}
        transition={{
          duration: reduceMotion ? 0 : 0.9,
          ease: MOTION.ease.heavy,
        }}
        aria-hidden={!hoveredStill}
      >
        {meta ? (
          <p className="layout-grid site-meta-row text-caption">
            <span className="site-meta-client">{meta.client}</span>
            <span className="site-meta-title">{meta.title}</span>
            <span className="site-meta-tags">{meta.tags}</span>
          </p>
        ) : null}
      </motion.div>
    </main>
  );
}
