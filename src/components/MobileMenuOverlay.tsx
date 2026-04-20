"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MOTION } from "@/lib/motion";
import type { SiteNavItem } from "@/lib/site-nav";

const NAV_ITEMS: SiteNavItem[] = [
  { label: "Info", href: "/info" },
  { label: "Work", href: "/work" },
  { label: "Exhibitions", href: "/exhibitions", comingSoon: true },
  { label: "Radio", href: "/radio", comingSoon: true },
];

const overlayTransition = {
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
  /** Two-digit accent number shown in the top-right corner of the row. */
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
  /**
   * Optional override, currently ignored — the overlay always shows the
   * canonical site nav (Home, Info, Work, Exhibitions, Radio).
   */
  navItems?: SiteNavItem[];
};

export function MobileMenuTrigger({
  triggerColor = "var(--color-black)",
}: MobileMenuOverlayProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const items = NAV_ITEMS;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  const overlay = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayTransition}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 300,
            background: "#ce0000",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "var(--spacing-margin)",
            boxSizing: "border-box",
          }}
        >
          {/* Close button — top right */}
          <button
            type="button"
            onClick={close}
            className="text-body"
            style={{
              position: "absolute",
              top: "calc(var(--spacing-margin) + env(safe-area-inset-top, 0px))",
              right: "var(--spacing-margin)",
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: "#ffffff",
              zIndex: 1,
            }}
          >
            Close
          </button>

          {/* Nav links — Home first (black), then Info, Work, … */}
          <nav style={{ display: "flex", flexDirection: "column", gap: 0 }}>
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
                  <span
                    className="text-heading"
                    style={{ color: "#ffffff" }}
                  >
                    {item.label}
                  </span>
                  <span
                    className="text-body"
                    style={{ color: "#000000" }}
                  >
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
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-body"
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          color: triggerColor,
        }}
      >
        Menu
      </button>

      {mounted ? createPortal(overlay, document.body) : null}
    </>
  );
}
