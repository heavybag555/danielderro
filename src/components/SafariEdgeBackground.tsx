"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const THEME_META = 'meta[name="theme-color"]';
const EDGE_SELECTOR = ".edge-top, .edge-bottom";
const MENU_SAMPLE_MS = 700;

type EdgePalette = {
  top: string;
  bottom: string;
};

type RestoredDocumentStyles = {
  htmlBackground: string;
  bodyBackground: string;
  edgeTop: string;
  edgeBottom: string;
  theme: string | null;
  createdMeta: boolean;
};

function toHex(color: string): string | null {
  const value = color.trim().toLowerCase();
  if (!value || value === "transparent") return null;

  if (value.startsWith("#")) {
    if (value.length === 4) {
      const r = value[1];
      const g = value[2];
      const b = value[3];
      return `#${r}${r}${g}${g}${b}${b}`;
    }
    return value.length === 7 ? value : null;
  }

  const match = value.match(
    /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)$/,
  );
  if (!match) return null;

  const alpha = match[4];
  if (alpha !== undefined) {
    const parsed = alpha.endsWith("%")
      ? Number(alpha.slice(0, -1)) / 100
      : Number(alpha);
    if (parsed < 0.99) return null;
  }

  const channel = (part: string) =>
    Math.max(0, Math.min(255, Math.round(Number(part))))
      .toString(16)
      .padStart(2, "0");

  return `#${channel(match[1])}${channel(match[2])}${channel(match[3])}`;
}

function themeFallback(): string {
  const token = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-black")
    .trim();
  return toHex(token) ?? "#000000";
}

function backgroundAt(x: number, y: number, fallback: string): string {
  const maxX = Math.max(0, window.innerWidth - 1);
  const maxY = Math.max(0, window.innerHeight - 1);
  const stack = document.elementsFromPoint(
    Math.min(Math.max(0, x), maxX),
    Math.min(Math.max(0, y), maxY),
  );

  for (const el of stack) {
    if (!(el instanceof Element) || el.closest(EDGE_SELECTOR)) continue;
    const style = getComputedStyle(el);
    if (style.visibility === "hidden" || Number(style.opacity) === 0) continue;
    const hex = toHex(style.backgroundColor);
    if (hex) return hex;
  }

  return fallback;
}

/** One read of the visible top and bottom edges, shared by every target. */
function readPalette(): EdgePalette {
  const fallback = themeFallback();
  const viewport = window.visualViewport;
  const width = viewport?.width ?? window.innerWidth;
  const height = viewport?.height ?? window.innerHeight;
  if (width <= 0 || height <= 0) return { top: fallback, bottom: fallback };

  const offsetLeft = viewport?.offsetLeft ?? 0;
  const offsetTop = viewport?.offsetTop ?? 0;
  const inset = Math.min(4, Math.max(0, height / 2 - 1));
  const x = offsetLeft + width / 2;

  return {
    top: backgroundAt(x, offsetTop + inset, fallback),
    bottom: backgroundAt(x, offsetTop + height - inset, fallback),
  };
}

function themeMeta(): { meta: HTMLMetaElement; created: boolean } {
  const existing = document.querySelector<HTMLMetaElement>(
    `${THEME_META}:not([media])`,
  );
  if (existing) return { meta: existing, created: false };

  const meta = document.createElement("meta");
  meta.setAttribute("name", "theme-color");
  document.head.appendChild(meta);
  return { meta, created: true };
}

function captureStyles(meta: HTMLMetaElement, created: boolean): RestoredDocumentStyles {
  const root = document.documentElement;
  return {
    htmlBackground: root.style.backgroundColor,
    bodyBackground: document.body.style.backgroundColor,
    edgeTop: root.style.getPropertyValue("--edge-top-background"),
    edgeBottom: root.style.getPropertyValue("--edge-bottom-background"),
    theme: created ? null : meta.getAttribute("content"),
    createdMeta: created,
  };
}

function applyPalette(palette: EdgePalette, meta: HTMLMetaElement) {
  const root = document.documentElement;
  root.style.setProperty("--edge-top-background", palette.top);
  root.style.setProperty("--edge-bottom-background", palette.bottom);
  root.style.backgroundColor = palette.top;
  document.body.style.backgroundColor = palette.bottom;
  meta.setAttribute("content", palette.top);
}

function restoreStyles(saved: RestoredDocumentStyles, meta: HTMLMetaElement) {
  const root = document.documentElement;
  root.style.backgroundColor = saved.htmlBackground;
  document.body.style.backgroundColor = saved.bodyBackground;

  if (saved.edgeTop) root.style.setProperty("--edge-top-background", saved.edgeTop);
  else root.style.removeProperty("--edge-top-background");

  if (saved.edgeBottom) {
    root.style.setProperty("--edge-bottom-background", saved.edgeBottom);
  } else {
    root.style.removeProperty("--edge-bottom-background");
  }

  if (saved.createdMeta) meta.remove();
  else if (saved.theme !== null) meta.setAttribute("content", saved.theme);
}

function attachEdgeColors(): () => void {
  const { meta, created } = themeMeta();
  const saved = captureStyles(meta, created);
  let frame = 0;
  let applied = "";
  let appliedTop = "";
  let menuUntil = 0;
  let trackingMenu = false;

  const apply = () => {
    frame = 0;
    const palette = readPalette();
    const key = `${palette.top}|${palette.bottom}`;
    if (key === applied) return;
    applied = key;
    appliedTop = palette.top;
    applyPalette(palette, meta);
  };

  const schedule = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(apply);
  };

  const trackMenu = () => {
    menuUntil = performance.now() + MENU_SAMPLE_MS;
    if (trackingMenu) return;
    trackingMenu = true;
    const step = () => {
      schedule();
      if (performance.now() < menuUntil) {
        window.requestAnimationFrame(step);
        return;
      }
      trackingMenu = false;
    };
    step();
  };

  const onMenuAttribute: MutationCallback = (records) => {
    for (const record of records) {
      if (record.attributeName === "data-mobile-menu-open") {
        trackMenu();
        return;
      }
    }
    schedule();
  };

  const onVisible = () => {
    if (document.visibilityState === "visible") schedule();
  };

  const viewport = window.visualViewport;
  const menuObserver = new MutationObserver(onMenuAttribute);
  menuObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-mobile-menu-open"],
  });

  const metaObserver = new MutationObserver(() => {
    if (meta.getAttribute("content") !== appliedTop) schedule();
  });
  metaObserver.observe(meta, { attributes: true, attributeFilter: ["content"] });

  window.addEventListener("scroll", schedule, { capture: true, passive: true });
  window.addEventListener("resize", schedule);
  window.addEventListener("pageshow", schedule);
  window.addEventListener("orientationchange", schedule);
  document.addEventListener("visibilitychange", onVisible);
  viewport?.addEventListener("resize", schedule);
  viewport?.addEventListener("scroll", schedule);

  apply();

  return () => {
    window.cancelAnimationFrame(frame);
    menuObserver.disconnect();
    metaObserver.disconnect();
    window.removeEventListener("scroll", schedule, true);
    window.removeEventListener("resize", schedule);
    window.removeEventListener("pageshow", schedule);
    window.removeEventListener("orientationchange", schedule);
    document.removeEventListener("visibilitychange", onVisible);
    viewport?.removeEventListener("resize", schedule);
    viewport?.removeEventListener("scroll", schedule);
    restoreStyles(saved, meta);
  };
}

/**
 * Paints the Mobile Safari status bar and bottom toolbar with the same colors
 * as the visible page edges. Studio keeps its own chrome.
 */
export default function SafariEdgeBackground() {
  const pathname = usePathname();
  const enabled = !pathname.startsWith("/studio");

  useEffect(() => {
    if (!enabled) return;
    return attachEdgeColors();
  }, [enabled, pathname]);

  if (!enabled) return null;

  return (
    <>
      <div className="edge-top" aria-hidden="true" />
      <div className="edge-bottom" aria-hidden="true" />
    </>
  );
}
