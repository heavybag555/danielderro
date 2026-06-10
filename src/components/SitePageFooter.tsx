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

const FOOTER_LOGO_CLASS =
  "box-border inline-block h-[40px] w-auto shrink-0 border-[0.5px] border-black object-contain align-top";

function ContactBlock() {
  return (
    <section className="site-footer-copy flex min-w-0 flex-col gap-0">
      <div className="flex flex-col gap-0">
        <div className="flex flex-col gap-0">
          <span className="text-caption">Tel. 00 32 15 75 59 43</span>
          <a
            href={SITE_CONTACT_MAILTO}
            className="text-caption hover-smooth underline underline-offset-2"
          >
            {SITE_CONTACT_EMAIL}
          </a>
        </div>
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
          className="text-caption hover-smooth no-underline hover:underline underline-offset-2"
        >
          @danielderro_
        </a>
        <a
          href={SITE_INSTAGRAM_NO_SCHOOL_STUDIO_RECORDS}
          target="_blank"
          rel="noopener noreferrer"
          className="text-caption hover-smooth no-underline hover:underline underline-offset-2"
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
 */
export default function SitePageFooter({ onDark = false }: SitePageFooterProps) {
  const leftLogos = HERO_LOGOS.slice(0, 3);
  const rightLogos = HERO_LOGOS.slice(3);

  return (
    <section
      className={["site-page-footer", onDark ? "site-footer-on-dark" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="page-grid items-start">
        <div className="site-page-footer-logos col-span-1 col-start-1 row-start-1 min-w-0 md:col-start-2 lg:col-start-4">
          {leftLogos.map((logo) => (
            <img
              key={logo.src}
              src={logo.src}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
              className={FOOTER_LOGO_CLASS}
            />
          ))}
        </div>

        <div className="site-page-footer-cell col-span-1 col-start-1 row-start-2 min-w-0 md:col-start-3 md:row-start-1 lg:col-start-5 lg:row-start-1">
          <ContactBlock />
        </div>

        <div className="site-page-footer-logos site-page-footer-logos--end col-span-1 col-start-2 row-start-1 min-w-0 md:col-start-4 md:row-start-1 lg:col-start-6">
          {rightLogos.map((logo) => (
            <img
              key={logo.src}
              src={logo.src}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
              className={FOOTER_LOGO_CLASS}
            />
          ))}
        </div>

        <div className="site-page-footer-cell col-span-1 col-start-2 row-start-2 min-w-0 md:col-start-2 md:row-start-2 lg:col-start-7 lg:row-start-1">
          <FollowBlock />
        </div>
      </div>
    </section>
  );
}
