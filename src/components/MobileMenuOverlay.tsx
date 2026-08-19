"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Info", href: "/info" },
  { label: "Work", href: "/work" },
  { label: "Radio", href: "/radio" },
] as const;

function pageLabel(pathname: string): string {
  if (pathname === "/") return "Home";
  if (pathname.startsWith("/info")) return "Info";
  if (pathname.startsWith("/work")) return "Work";
  if (pathname.startsWith("/radio")) return "Radio";
  return "Menu";
}

const LABEL_FADE_MS = 320;

function NotchTriggerLabel({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState(text);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const displayedRef = useRef(text);

  useEffect(() => {
    displayedRef.current = displayed;
  }, [displayed]);

  useEffect(() => {
    if (text === displayedRef.current) {
      setPhase("in");
      return;
    }

    setPhase("out");
    const swap = window.setTimeout(() => {
      setDisplayed(text);
      setPhase("in");
    }, LABEL_FADE_MS);

    return () => window.clearTimeout(swap);
  }, [text]);

  return (
    <span className="site-notch-label" data-phase={phase} aria-hidden="true">
      {displayed}
    </span>
  );
}

function isCurrent(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function PlusMinusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      aria-hidden
      className="site-notch-plus"
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path
        className="site-notch-plus-h"
        fill="currentColor"
        d="M18 12.998H6a1 1 0 0 1 0-2h12a1 1 0 0 1 0 2"
      />
      <path
        className="site-notch-plus-v"
        fill="currentColor"
        d="M13 17.998v-12a1 1 0 0 0-2 0v12a1 1 0 0 0 2 0"
      />
    </svg>
  );
}

/** Desktop nav: all pages side by side across the compact container. */
export function SiteNavLinks() {
  const pathname = usePathname();

  return (
    <nav className="site-header-nav" aria-label="Site navigation">
      {NAV_ITEMS.map((item) => {
        const current = isCurrent(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="site-header-nav-link text-small hover-smooth"
            data-current={current ? "true" : "false"}
            aria-current={current ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileMenuTrigger() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentLabel = pageLabel(pathname);

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="site-notch"
      data-open={open ? "true" : "false"}
    >
      <button
        type="button"
        onClick={toggle}
        className="site-notch-trigger text-small"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        <NotchTriggerLabel text={open ? "Menu" : currentLabel} />
        <PlusMinusIcon />
      </button>

      <nav className="site-notch-dropdown" aria-label="Site navigation" aria-hidden={!open}>
        <div className="site-notch-dropdown-inner">
          {NAV_ITEMS.map((item) => {
            const current = isCurrent(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                tabIndex={open ? 0 : -1}
                onClick={close}
                className="site-notch-link text-small"
                data-current={current ? "true" : "false"}
                aria-current={current ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
