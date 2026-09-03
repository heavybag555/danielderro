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
import Image from "next/image";
import Link from "next/link";
import { DialRoot, useDialKit } from "dialkit";
import "dialkit/styles.css";
import { motion, useReducedMotion } from "framer-motion";
import { sanityLoader } from "@/sanity/lib/image";
import { MOTION } from "@/lib/motion";
import { useMediaQuery } from "@/lib/use-media-query";
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

type TileNode = {
  el: HTMLDivElement;
  video: HTMLVideoElement | null;
  item: BarrelLayoutItem;
  cj: number;
  ck: number;
};

function posterUrl(still: GalleryStill): string {
  if (still.remote) return still.src;
  const url = new URL(still.src);
  url.searchParams.set("w", "800");
  url.searchParams.set("q", "80");
  return url.toString();
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
  sizes,
  bind,
  onHover,
  onLeave,
  isDragClick,
}: {
  world: BarrelWorld;
  copiesX: number;
  copiesY: number;
  sizes: string;
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
                    src={item.still.videoSrc}
                    poster={posterUrl(item.still)}
                    muted
                    loop
                    playsInline
                    preload="none"
                  />
                ) : (
                  <Image
                    {...(item.still.remote ? {} : { loader: sanityLoader })}
                    src={item.still.src}
                    alt=""
                    fill
                    sizes={sizes}
                    quality={90}
                    style={{ objectFit: "contain" }}
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
  const flatten = Boolean(reduceMotion);
  const params = useDialKit(
    "Gallery dome",
    {
      columns: [6, 3, 14, 1],
      tileWidth: [300, 96, 480, 1],
      gap: [24, 8, 80, 1],
      perspective: [1580, 500, 3600, 10],
      bulge: [240, 0, 900, 2],
      spread: [1, 0.15, 1, 0.01],
      curve: [1.84, 0, 2.5, 0.01],
      round: [0, 0, 64, 1],
      inertia: [0.82, 0.82, 0.985, 0.001],
    },
    { id: "gallery-dome-v2", persist: true },
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
  const dragging = useRef(false);
  const dragMoved = useRef(false);
  const pointer = useRef({ id: -1, x: 0, y: 0 });
  const raf = useRef(0);
  const view = useRef({ w: 0, h: 0 });
  const paramsRef = useRef(params);
  const worldRef = useRef(world);
  const flattenRef = useRef(flatten);
  paramsRef.current = params;
  worldRef.current = world;
  flattenRef.current = flatten;

  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const hoverTimer = useRef<number | null>(null);
  const hoveredStill = stills.find((still) => still.key === hoveredKey) ?? null;
  const [lastHovered, setLastHovered] = useState<GalleryStill | null>(null);
  const meta = hoveredStill ?? lastHovered;

  useEffect(() => {
    if (hoveredStill) setLastHovered(hoveredStill);
  }, [hoveredStill]);

  const [dialsReady, setDialsReady] = useState(false);
  useEffect(() => setDialsReady(true), []);

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

    nodes.current.forEach(({ el, video, item, cj, ck }) => {
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
          if (video && !video.paused) video.pause();
        }
        return;
      }

      const t = projectDomeTile(sx, sy, item.w, item.h, vw, vh, optics, flat);
      el.style.visibility = "visible";
      el.style.transform = `translate3d(${t.x}px, ${t.y}px, ${t.z}px) rotateX(${t.rotateX}deg) rotateY(${t.rotateY}deg)`;
      el.style.borderRadius = `${t.radius}px`;

      if (video) {
        // Decorative loops stop under prefers-reduced-motion.
        if (flat) {
          if (!video.paused) video.pause();
        } else if (video.paused) {
          video.play().catch(() => {});
        }
      }
    });

    const space = spaceRef.current;
    if (space && space.dataset.ready !== "true") {
      space.dataset.ready = "true";
    }
  }, []);

  const wrapPan = useCallback(() => {
    // X wraps at the shared period; Y wraps per column inside paint, so panY
    // stays unbounded (pixel floats are exact far beyond any session's travel).
    const worldNow = worldRef.current;
    if (worldNow.width > 0) pan.current.x = wrapCoord(pan.current.x, worldNow.width);
  }, []);

  const tick = useCallback(() => {
    raf.current = 0;
    wrapPan();

    if (!dragging.current) {
      pan.current.x += pan.current.vx;
      pan.current.y += pan.current.vy;
      const damp = paramsRef.current.inertia;
      pan.current.vx *= damp;
      pan.current.vy *= damp;
      if (Math.abs(pan.current.vx) < 0.04) pan.current.vx = 0;
      if (Math.abs(pan.current.vy) < 0.04) pan.current.vy = 0;
    }

    paint();

    const coasting =
      !dragging.current && (pan.current.vx !== 0 || pan.current.vy !== 0);
    if (dragging.current || coasting) {
      raf.current = window.requestAnimationFrame(tick);
    }
  }, [paint, wrapPan]);

  const startLoop = useCallback(() => {
    if (raf.current) return;
    raf.current = window.requestAnimationFrame(tick);
  }, [tick]);

  // Re-measure, size the pool, and repaint whenever layout inputs change.
  useLayoutEffect(() => {
    measure();
    syncCopies();
    paint();
  }, [measure, syncCopies, paint, world, copies, params, flatten]);

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
      event.preventDefault();
      pan.current.x += event.deltaX;
      pan.current.y += event.deltaY;
      pan.current.vx = 0;
      pan.current.vy = 0;
      startLoop();
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      observer.disconnect();
      node.removeEventListener("wheel", onWheel);
    };
  }, [measure, syncCopies, paint, startLoop]);

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
    if (pan.current.vx !== 0 || pan.current.vy !== 0) {
      startLoop();
    } else {
      wrapPan();
      paint();
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = 72;
    if (event.key === "ArrowLeft") pan.current.x -= step;
    else if (event.key === "ArrowRight") pan.current.x += step;
    else if (event.key === "ArrowUp") pan.current.y -= step;
    else if (event.key === "ArrowDown") pan.current.y += step;
    else return;
    event.preventDefault();
    pan.current.vx = 0;
    pan.current.vy = 0;
    startLoop();
  };

  const sizes = `${Math.ceil(tileWidth * 1.5)}px`;

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
            sizes={sizes}
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
