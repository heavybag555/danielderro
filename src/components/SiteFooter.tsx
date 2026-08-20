type SiteFooterProps = {
  client: string;
  title: string;
  tags?: string;
  slide?: {
    current: number;
    total: number;
  };
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Project-detail caption row. Same client / title / tags measure as the
 * gallery hover meta, pinned to the bottom edge instead of the viewport center.
 */
export default function SiteFooter({
  client,
  title,
  tags,
  slide,
}: SiteFooterProps) {
  const showSlide = Boolean(slide && slide.total > 0);

  return (
    <footer className="project-footer-shell blend-overlay">
      <p className="layout-grid site-meta-row text-caption">
        <span className="site-meta-client">{client}</span>
        <span className="site-meta-title">{title}</span>
        {tags ? <span className="site-meta-tags">{tags}</span> : null}
        {showSlide && slide ? (
          <span className="site-meta-counter">
            <span aria-hidden="true">{pad(slide.current)}</span>
            <span aria-hidden="true" className="site-meta-counter-total">
              {pad(slide.total)}
            </span>
            <span className="visually-hidden" aria-live="polite">
              {`Slide ${slide.current} of ${slide.total}`}
            </span>
          </span>
        ) : null}
      </p>
    </footer>
  );
}
