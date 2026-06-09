import InfoColumns from "@/components/InfoColumns";

type SitePageFooterProps = {
  /** White body copy on dark surfaces (e.g. /work). */
  onDark?: boolean;
  /** Home: sit flush below the gallery with no gap above the divider. */
  flushTop?: boolean;
};

/**
 * Shared in-flow footer for home, info, and work. Project detail pages use
 * `SiteFooter` instead (title / tags / slide counter).
 */
export default function SitePageFooter({
  onDark = false,
  flushTop = false,
}: SitePageFooterProps) {
  return (
    <section
      className={[
        flushTop ? "site-page-footer-flush-top" : "",
        onDark ? "site-footer-on-dark" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <InfoColumns siteFooter footerFlushTop={flushTop} />
    </section>
  );
}
