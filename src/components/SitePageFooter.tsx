import InfoColumns from "@/components/InfoColumns";

type SitePageFooterProps = {
  /** White body copy on dark surfaces (e.g. /work). */
  onDark?: boolean;
};

/**
 * Shared in-flow footer for home, info, and work. Project detail pages use
 * `SiteFooter` instead (title / tags / slide counter).
 */
export default function SitePageFooter({
  onDark = false,
}: SitePageFooterProps) {
  return (
    <section
      className={["site-page-footer", onDark ? "site-footer-on-dark" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <InfoColumns siteFooter />
    </section>
  );
}
