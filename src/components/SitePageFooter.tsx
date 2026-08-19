type SitePageFooterProps = {
  /** Kept for existing call sites; copyright is grey on light and dark. */
  onDark?: boolean;
};

/** Shared in-flow footer: centered caption copyright in the 300px rule. */
export default function SitePageFooter(_props: SitePageFooterProps = {}) {
  return (
    <section className="site-page-footer">
      <p className="site-page-footer-copy content-compact text-caption">
        © 2026 NO SCHOOL STUDIOS. ALL RIGHTS RESERVED.
      </p>
    </section>
  );
}
