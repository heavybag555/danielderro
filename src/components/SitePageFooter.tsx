import {
  SITE_CONTACT_EMAIL,
  SITE_CONTACT_MAILTO,
  SITE_INSTAGRAM_DANIEL_DERRO,
  SITE_INSTAGRAM_NO_SCHOOL_STUDIO_RECORDS,
} from "@/lib/site-contact";
import { HERO_LOGOS } from "@/lib/site-content";

type SitePageFooterProps = {
  /** White body copy on dark surfaces (e.g. /work, /radio). */
  onDark?: boolean;
};

function ContactBlock() {
  return (
    <section className="site-footer-copy flex min-w-0 flex-col gap-0">
      <div className="flex flex-col gap-0">
        <a
          href={SITE_CONTACT_MAILTO}
          className="text-body hover-smooth underline underline-offset-2"
        >
          {SITE_CONTACT_EMAIL}
        </a>
        <p className="text-micro-tight m-0 mt-5">
          Based between New York and Los Angeles with international project capabilities.
        </p>
      </div>
    </section>
  );
}

function FollowBlock() {
  return (
    <section className="site-footer-copy flex min-w-0 flex-col gap-0">
      <div className="flex flex-col gap-0">
        <a
          href={SITE_INSTAGRAM_DANIEL_DERRO}
          target="_blank"
          rel="noopener noreferrer"
          className="text-body hover-smooth no-underline hover:underline underline-offset-2"
        >
          @danielderro_
        </a>
        <a
          href={SITE_INSTAGRAM_NO_SCHOOL_STUDIO_RECORDS}
          target="_blank"
          rel="noopener noreferrer"
          className="text-body hover-smooth no-underline hover:underline underline-offset-2"
        >
          @noschoolstudiorecords
        </a>
      </div>
    </section>
  );
}

/**
 * Shared in-flow footer for home, info, work, and radio. Project detail pages use
 * `SiteFooter` instead (title / tags / slide counter).
 *
 * Large desktop (10-col): contact col 4, follow col 5, logos col 8.
 * Each block occupies a single grid track; gutters come from `.page-grid`.
 */
export default function SitePageFooter({ onDark = false }: SitePageFooterProps) {
  const rightLogos = HERO_LOGOS.slice(3);

  return (
    <section
      className={["site-page-footer", onDark ? "site-footer-on-dark" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="page-grid site-page-footer-grid items-start">
        <div className="site-page-footer-cell site-page-footer-cell--contact min-w-0">
          <ContactBlock />
        </div>

        <div className="site-page-footer-cell site-page-footer-cell--follow min-w-0">
          <FollowBlock />
        </div>

        <div className="site-page-footer-logos site-page-footer-logos--right site-page-footer-logos--end min-w-0">
          {rightLogos.map((logo) => (
            <img
              key={logo.src}
              src={logo.src}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
              className="site-page-footer-logo"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
