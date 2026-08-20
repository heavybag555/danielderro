"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "@/lib/use-media-query";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Info", href: "/info" },
  { label: "Work", href: "/work" },
  { label: "Radio", href: "/radio" },
] as const;

function isCurrent(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
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

export function MobileMenuTrigger({
  blendOverlay = false,
}: {
  blendOverlay?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const blendClass = blendOverlay ? " blend-overlay" : "";

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isDesktop) setOpen(false);
  }, [isDesktop]);

  useEffect(() => {
    const root = document.documentElement;
    if (open) root.setAttribute("data-mobile-menu-open", "true");
    else root.removeAttribute("data-mobile-menu-open");
    return () => root.removeAttribute("data-mobile-menu-open");
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!(event.target as Element | null)?.closest("[data-mobile-menu]")) {
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
    <>
      <div className={`site-header-notch-cell${blendClass}`} data-mobile-menu>
        <div className="site-notch" data-open={open ? "true" : "false"}>
          <button
            type="button"
            onClick={toggle}
            className="site-notch-trigger text-small"
            aria-expanded={open}
            aria-controls="site-mobile-nav"
            aria-label={open ? "Close" : "Menu"}
          >
            <span className="site-notch-swap">
              <span className="site-notch-label" data-on={open ? "false" : "true"}>
                Menu
              </span>
              <span className="site-notch-label" data-on={open ? "true" : "false"}>
                Close
              </span>
            </span>
          </button>
        </div>
      </div>

      <div
        className="site-mobile-sheet"
        data-mobile-menu
        data-open={open ? "true" : "false"}
        aria-hidden={!open}
      >
        <nav
          id="site-mobile-nav"
          className="site-mobile-sheet-nav layout-full"
          aria-label="Site navigation"
        >
          {NAV_ITEMS.map((item) => {
            const current = isCurrent(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                tabIndex={open ? 0 : -1}
                onClick={close}
                className="site-mobile-nav-link text-heading"
                data-current={current ? "true" : "false"}
                aria-current={current ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
