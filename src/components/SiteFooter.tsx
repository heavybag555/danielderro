import type { ReactNode } from "react";

type SiteFooterProps = {
  activePath?: string;
  inverted?: boolean;
  /**
   * Below `lg`, hide Daniel Derro / No-School (e.g. when shown in `SiteBrandStrip`).
   * Kept for API compatibility; no longer affects rendering since the default
   * nav footer has been removed in favor of the top-right Menu button.
   */
  hideBrandBelowLg?: boolean;
  leftContent?: ReactNode;
  middleContent?: ReactNode;
  rightContent?: ReactNode;
};

const footerBar = {
  position: "fixed" as const,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 200,
  paddingLeft: "var(--spacing-margin)",
  paddingRight: "var(--spacing-margin)",
  paddingTop: "var(--spacing-margin)",
  paddingBottom: "var(--spacing-margin)",
  boxSizing: "border-box" as const,
};

/**
 * Fixed bottom band, used only for project detail pages to carry
 * title / tags / slide counter. The default nav-row mode has been removed —
 * navigation lives inside the top-right Menu button (see `MobileMenuOverlay`).
 */
export default function SiteFooter({
  inverted = false,
  leftContent,
  middleContent,
  rightContent,
}: SiteFooterProps) {
  const isProjectFooter = leftContent !== undefined;

  if (!isProjectFooter) return null;

  return (
    <footer
      className={`page-grid project-footer-grid items-end ${inverted ? "" : "blend-overlay"}`}
      style={{
        ...footerBar,
        alignItems: "end",
      }}
    >
      <div className="project-footer-title">{leftContent}</div>
      <div className="project-footer-stack">
        {middleContent}
        {rightContent}
      </div>
      <div className="project-footer-split-tags">{middleContent}</div>
      <div className="project-footer-split-counter">{rightContent}</div>
      <div className="project-footer-spacer" aria-hidden />
    </footer>
  );
}
