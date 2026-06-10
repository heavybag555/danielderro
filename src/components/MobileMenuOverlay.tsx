"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MOTION } from "@/lib/motion";
import type { SiteNavItem } from "@/lib/site-nav";

const NAV_ITEMS: SiteNavItem[] = [
  { label: "Info", href: "/info" },
  { label: "Work", href: "/work" },
  { label: "Exhibitions", href: "/exhibitions", comingSoon: true },
  { label: "Radio", href: "/radio" },
];

const dropdownTransition = {
  duration: MOTION.duration.fade,
  ease: MOTION.ease.heavy,
} as const;

const navLinkBase: React.CSSProperties = {
  textDecoration: "none",
  display: "block",
  transition: "color 0.2s cubic-bezier(0.76, 0, 0.24, 1)",
};

type OverlayNavLinkProps = {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
  /** Resting color; swaps to the inverse on hover. */
  color: "#ffffff" | "#000000";
  /** Two-digit accent number shown beside the row. */
  accent: string;
};

function OverlayNavLink({
  href,
  onClick,
  children,
  color,
  accent,
}: OverlayNavLinkProps) {
  const [hovered, setHovered] = useState(false);
  const inverse = color === "#ffffff" ? "#000000" : "#ffffff";
  const activeColor = hovered ? inverse : color;
  return (
    <Link
      href={href}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...navLinkBase,
        color: activeColor,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        gap: 12,
      }}
    >
      <span className="text-heading">{children}</span>
      <span
        className="text-micro"
        style={{ color: activeColor, flexShrink: 0 }}
      >
        {accent}
      </span>
    </Link>
  );
}

type MobileMenuOverlayProps = {
  /** Foreground color for the trigger label (matches surrounding brand links). */
  triggerColor?: string;
  /** Exclusion blend on the trigger only (home hero); dropdown stays solid red. */
  blendOverlay?: boolean;
  /**
   * Optional override, currently ignored — the dropdown always shows the
   * canonical site nav (Home, Info, Work, Exhibitions, Radio).
   */
  navItems?: SiteNavItem[];
};

export function MobileMenuTrigger({
  triggerColor = "var(--color-black)",
  blendOverlay = false,
}: MobileMenuOverlayProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const items = NAV_ITEMS;

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((prev) => !prev), []);

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
    <div ref={containerRef} className="relative flex justify-end">
      <button
        type="button"
        onClick={toggle}
        className="text-body"
        aria-expanded={open}
        aria-haspopup="true"
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
        }}
      >
        <span
          className={["site-header-brand", blendOverlay ? "blend-overlay" : ""]
            .filter(Boolean)
            .join(" ")}
          style={blendOverlay ? undefined : { color: triggerColor }}
        >
          {open ? "Close" : "Menu"}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.nav
            className="site-menu-dropdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={dropdownTransition}
            aria-label="Site navigation"
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              zIndex: 250,
              marginTop: 4,
              padding: "var(--spacing-margin)",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}
          >
            <OverlayNavLink href="/" onClick={close} color="#000000" accent="01">
              Home
            </OverlayNavLink>
            {items.map((item, idx) =>
              item.comingSoon ? (
                <span
                  key={item.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    opacity: 0.4,
                    cursor: "default",
                  }}
                >
                  <span className="text-heading" style={{ color: "#ffffff" }}>
                    {item.label}
                  </span>
                  <span className="text-body" style={{ color: "#000000" }}>
                    – Coming Soon
                  </span>
                </span>
              ) : (
                <OverlayNavLink
                  key={item.label}
                  href={item.href}
                  onClick={close}
                  color="#000000"
                  accent={String(idx + 2).padStart(2, "0")}
                >
                  {item.label}
                </OverlayNavLink>
              ),
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
