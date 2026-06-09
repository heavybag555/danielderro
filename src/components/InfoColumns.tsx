import Image from "next/image";

import {
  SITE_CONTACT_EMAIL,
  SITE_CONTACT_MAILTO,
  SITE_INSTAGRAM_DANIEL_DERRO,
  SITE_INSTAGRAM_NO_SCHOOL_STUDIO_RECORDS,
} from "@/lib/site-contact";
import { HERO_LOGOS, SITE_ABOUT_COPY, SITE_CLIENTS_COPY } from "@/lib/site-content";

export function AboutBlock({
  className,
  blendTitle = false,
  hideTitle = false,
}: {
  className?: string;
  blendTitle?: boolean;
  hideTitle?: boolean;
}) {
  return (
    <div className={["flex flex-col gap-0", className].filter(Boolean).join(" ")}>
      {!hideTitle ? (
        <h2
          className={["text-semantic-title pl-5", blendTitle ? "blend-overlay" : ""]
            .filter(Boolean)
            .join(" ")}
        >
          About
        </h2>
      ) : null}
      <div className="flex flex-col gap-5">
        <p className="text-body" style={{ color: "var(--color-primary)", margin: 0 }}>
          {SITE_ABOUT_COPY}
        </p>
      </div>
    </div>
  );
}

export function ClientsBlock({
  className,
  blendTitle = false,
}: {
  className?: string;
  blendTitle?: boolean;
}) {
  return (
    <div className={["flex flex-col gap-0", className].filter(Boolean).join(" ")}>
      <h2
        className={["text-semantic-title pl-5", blendTitle ? "blend-overlay" : ""]
          .filter(Boolean)
          .join(" ")}
      >
        Clients
      </h2>
      <p className="text-body" style={{ color: "var(--color-primary)", margin: 0 }}>
        {SITE_CLIENTS_COPY}
      </p>
    </div>
  );
}

function ContactBlock() {
  return (
    <section className="flex min-w-0 flex-col gap-0">
      <h2 className="site-footer-title text-semantic-title pl-5">
        Contact
      </h2>
      <div className="site-footer-copy flex flex-col gap-5">
        <div className="flex flex-col">
          <span className="text-body">Tel. 00 32 15 75 59 43</span>
          <a
            href={SITE_CONTACT_MAILTO}
            className="text-body hover-smooth underline underline-offset-2"
          >
            {SITE_CONTACT_EMAIL}
          </a>
        </div>
        <p className="text-micro-tight" style={{ margin: 0 }}>
          Based between New York and Los Angeles with international project capabilities.
        </p>
      </div>
    </section>
  );
}

function FollowBlock() {
  return (
    <section className="flex min-w-0 flex-col gap-0">
      <h2 className="site-footer-title text-semantic-title pl-5">
        Follow
      </h2>
      <div className="site-footer-copy flex flex-col">
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

function FooterLogosBlock({
  logos,
  align = "start",
}: {
  logos: readonly (typeof HERO_LOGOS)[number][];
  align?: "start" | "end";
}) {
  return (
    <div
      className={[
        "flex min-w-max items-start gap-0",
        align === "end" ? "self-end justify-end" : "self-start justify-start",
      ].join(" ")}
    >
      {logos.map((logo) => (
        <img
          key={logo.src}
          src={logo.src}
          alt={logo.alt}
          width={logo.width}
          height={logo.height}
          className="box-border block h-[40px] w-auto shrink-0 border-[0.5px] border-black object-contain"
          style={{ objectFit: "contain" }}
        />
      ))}
    </div>
  );
}

type InfoColumnsProps = {
  /** Omit the Contact column (header: contact lives in the lower section). */
  hideContact?: boolean;
  /** Remove the About and Clients columns entirely (empty placeholders keep the grid). */
  hideAboutClients?: boolean;
  /** Shift About + Clients one slot to the right (empty placeholder in slot 1). */
  shiftRight?: boolean;
  /** Show the Contact block in the middle (slot 2) of the text grid. */
  contactMiddle?: boolean;
  /** Omit the left-column hero image (empty placeholder keeps the grid). */
  hideHeroImage?: boolean;
  /**
   * Home page only: below the `md` breakpoint, render About above the hero images; Clients stay
   * below the images.
   */
  homeMobileAboutAboveHero?: boolean;
  /** Shared page footer: Contact in col 3, Follow in col 4, semantic section titles. */
  siteFooter?: boolean;
};

export default function InfoColumns({
  hideContact = false,
  hideAboutClients = false,
  shiftRight = false,
  contactMiddle = false,
  hideHeroImage = false,
  homeMobileAboutAboveHero = false,
  siteFooter = false,
}: InfoColumnsProps) {
  const showAboutMobileFirst =
    homeMobileAboutAboveHero && !shiftRight && !hideAboutClients;

  const homeHeroStackedAboutClients =
    hideContact && homeMobileAboutAboveHero && !hideAboutClients;

  /** Home lower band: mobile uses two columns; Contact + Follow stack in column one. */
  const contactFollowMobileTwoCol =
    contactMiddle && hideAboutClients && !homeHeroStackedAboutClients;

  if (siteFooter) {
    const footerLogosLeft = HERO_LOGOS.slice(0, 3);
    const footerLogosRight = HERO_LOGOS.slice(3);

    return (
      <div className="page-grid items-start">
        <div className="col-span-1 col-start-1 row-start-1 min-w-max md:col-start-2 md:row-start-1 lg:col-start-2 lg:row-start-1">
          <FooterLogosBlock logos={footerLogosLeft} />
        </div>
        <div className="col-span-1 col-start-1 row-start-2 md:col-start-3 md:row-start-1 lg:col-start-3 lg:row-start-1">
          <ContactBlock />
        </div>
        <div className="col-span-1 col-start-2 row-start-1 min-w-max md:col-start-4 md:row-start-1 lg:col-start-4 lg:row-start-1">
          <FooterLogosBlock logos={footerLogosRight} align="end" />
        </div>
        <div className="col-span-1 col-start-2 row-start-2 md:col-start-4 md:row-start-2 lg:col-start-5 lg:row-start-1">
          <FollowBlock />
        </div>
      </div>
    );
  }

  return (
    <>
      {showAboutMobileFirst ? (
        <div className="mb-5 w-full md:hidden">
          <AboutBlock />
        </div>
      ) : null}

      <div className="page-grid">
      {!homeHeroStackedAboutClients ? (
        <>
          <div className="hidden lg:col-span-1 lg:block" aria-hidden />
          <div className="hidden lg:col-span-1 lg:block" aria-hidden />
        </>
      ) : (
        <div className="hidden md:col-span-2 md:col-start-1 md:block lg:col-span-2 lg:col-start-1" aria-hidden />
      )}

      <div
        className={
          homeHeroStackedAboutClients
            ? "col-span-2 w-full min-w-0 md:col-span-1 md:col-start-3 lg:col-span-1 lg:col-start-3"
            : "col-span-2 w-full min-w-0 md:col-span-2 lg:col-span-1 lg:col-start-3"
        }
      >
        {!hideHeroImage &&
          (homeHeroStackedAboutClients ? (
            <div className="grid w-full min-w-0 grid-cols-1 gap-0">
              <Image
                src="/images/daniel-hero-new.jpg"
                alt="Daniel Derro"
                width={2000}
                height={1470}
                className="block h-auto w-full max-w-full"
                priority
              />
              <Image
                src="/images/debt-ss-105.jpg"
                alt="Daniel Derro"
                width={4083}
                height={3000}
                className="block h-auto w-full max-w-full"
              />
            </div>
          ) : (
            <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
              <Image
                src="/images/daniel-hero-new.jpg"
                alt="Daniel Derro"
                width={2000}
                height={1470}
                style={{ width: "100%", height: "auto", display: "block" }}
                priority
              />
              <Image
                src="/images/debt-ss-105.jpg"
                alt="Daniel Derro"
                width={4083}
                height={3000}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          ))}
      </div>

      <div
        className={
          homeHeroStackedAboutClients
            ? "col-span-2 grid w-full min-w-0 grid-cols-1 gap-x-(--spacing-gutter) gap-y-0 md:col-span-1 md:col-start-4 md:grid-cols-subgrid lg:col-span-1 lg:col-start-4 lg:grid-cols-1 lg:gap-x-0"
            : contactFollowMobileTwoCol
              ? "col-span-2 grid w-full min-w-0 grid-cols-2 gap-x-(--spacing-gutter) gap-y-0 md:col-span-2 md:col-start-3 md:grid-cols-subgrid lg:col-span-3 lg:col-start-4 lg:grid-cols-subgrid"
              : "col-span-2 grid w-full min-w-0 grid-cols-1 gap-x-(--spacing-gutter) gap-y-5 md:col-span-2 md:col-start-3 md:grid-cols-subgrid lg:col-span-3 lg:col-start-4 lg:grid-cols-subgrid"
        }
      >
          {/* --- Slot 1 --- */}
          {shiftRight ? (
            <div />
          ) : hideAboutClients && contactMiddle ? (
            <div className="col-span-1 flex min-w-0 flex-col gap-5 md:contents">
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ paddingLeft: 20 }}>
                  <span className="text-caption" style={{ color: "var(--color-black)" }}>
                    Contact
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span className="text-body" style={{ color: "var(--color-primary)" }}>
                      Tel. 00 32 15 75 59 43
                    </span>
                    <a
                      href={SITE_CONTACT_MAILTO}
                      className="text-body hover-smooth underline underline-offset-2"
                      style={{ color: "var(--color-primary)" }}
                    >
                      {SITE_CONTACT_EMAIL}
                    </a>
                  </div>
                  <p className="text-micro-tight" style={{ color: "var(--color-primary)", margin: 0 }}>
                    Based between New York and Los Angeles with international project capabilities.
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ paddingLeft: 20 }}>
                  <span className="text-caption" style={{ color: "var(--color-black)" }}>
                    Follow
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <a
                    href={SITE_INSTAGRAM_DANIEL_DERRO}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-body hover-smooth no-underline hover:underline underline-offset-2"
                    style={{ color: "var(--color-primary)" }}
                  >
                    @danielderro_
                  </a>
                  <a
                    href={SITE_INSTAGRAM_NO_SCHOOL_STUDIO_RECORDS}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-body hover-smooth no-underline hover:underline underline-offset-2"
                    style={{ color: "var(--color-primary)" }}
                  >
                    @noschoolstudiorecords
                  </a>
                </div>
              </div>
            </div>
          ) : hideAboutClients ? (
            <div />
          ) : homeHeroStackedAboutClients ? (
            <div className="min-w-0">
              <div className="flex flex-col gap-5 lg:gap-[40px]">
                {showAboutMobileFirst ? (
                  <div className="hidden md:block">
                    <AboutBlock />
                  </div>
                ) : (
                  <AboutBlock />
                )}
                <ClientsBlock />
              </div>
            </div>
          ) : showAboutMobileFirst ? (
            <div className="hidden min-w-0 md:block">
              <AboutBlock />
            </div>
          ) : (
            <AboutBlock />
          )}

          {/* --- Slot 2 --- */}
          {homeHeroStackedAboutClients ? (
            <div />
          ) : contactMiddle && hideAboutClients ? (
            <div className="col-span-1 md:hidden" aria-hidden />
          ) : contactMiddle ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ paddingLeft: 20 }}>
                <span className="text-caption" style={{ color: "var(--color-black)" }}>
                  Contact
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span className="text-body" style={{ color: "var(--color-primary)" }}>
                    Tel. 00 32 15 75 59 43
                  </span>
                  <a
                    href={SITE_CONTACT_MAILTO}
                    className="text-body hover-smooth underline underline-offset-2"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {SITE_CONTACT_EMAIL}
                  </a>
                </div>
                <p className="text-micro-tight" style={{ color: "var(--color-primary)", margin: 0 }}>
                  Based between New York and Los Angeles with international project capabilities.
                </p>
              </div>
            </div>
          ) : shiftRight ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ paddingLeft: 20 }}>
                <span className="text-caption" style={{ color: "var(--color-black)" }}>
                  About
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <p className="text-body" style={{ color: "var(--color-primary)", margin: 0 }}>
                  Daniel Derro creates visual narratives for luxury fashion and cultural brands,
                  bringing authentic street perspective to premium campaigns. His work for Prada,
                  Dior, and Givenchy demonstrates his ability to translate genuine cultural moments
                  into compelling luxury brand stories.
                </p>
              </div>
            </div>
          ) : hideAboutClients ? (
            <div />
          ) : (
            <ClientsBlock />
          )}

          {/* --- Slot 3 (spans both sub-tracks on tablet so the row reads full-width) --- */}
          {contactMiddle && hideAboutClients ? (
            <div className="hidden md:block md:col-span-2 lg:col-span-1" aria-hidden />
          ) : shiftRight ? (
            <div
              className="md:col-span-2 lg:col-span-1"
              style={{ display: "flex", flexDirection: "column", gap: 20 }}
            >
              <div style={{ paddingLeft: 20 }}>
                <span className="text-caption" style={{ color: "var(--color-black)" }}>
                  Clients
                </span>
              </div>
              <p className="text-body" style={{ color: "var(--color-primary)", margin: 0 }}>
                Prada, Nike, Givenchy, Dior, Stüssy, Adidas, pgLang, Burberry, Carhartt WIP, Our
                Legacy, New Balance, Fake Mink, ASICS, Moncler, T Magazine, Giveon, Popeye, Stormzy,
                Yeezy, Slam Jam, Converse, Alo, Nike Golf, Crash, Jordan, Union, Dazed, Babylon,
                Neighborhood, Saint Laurent, Kaleidoscope, i-D, Interview Magazine
              </p>
            </div>
          ) : hideContact ? (
            homeHeroStackedAboutClients ? null : (
              <div className="md:col-span-2 lg:col-span-1" aria-hidden />
            )
          ) : (
            <div
              className="md:col-span-2 lg:col-span-1"
              style={{ display: "flex", flexDirection: "column", gap: 20 }}
            >
              <div style={{ paddingLeft: 20 }}>
                <span className="text-caption" style={{ color: "var(--color-black)" }}>
                  Follow
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <a
                  href={SITE_INSTAGRAM_DANIEL_DERRO}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-body hover-smooth no-underline hover:underline underline-offset-2"
                  style={{ color: "var(--color-primary)" }}
                >
                  @danielderro_
                </a>
                <a
                  href={SITE_INSTAGRAM_NO_SCHOOL_STUDIO_RECORDS}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-body hover-smooth no-underline hover:underline underline-offset-2"
                  style={{ color: "var(--color-primary)" }}
                >
                  @noschoolstudiorecords
                </a>
              </div>
            </div>
          )}
      </div>

      {homeHeroStackedAboutClients ? (
        <>
          <div className="hidden lg:col-span-1 lg:block lg:col-start-5" aria-hidden />
          <div className="hidden lg:col-span-1 lg:block lg:col-start-6" aria-hidden />
        </>
      ) : null}

    </div>
    </>
  );
}
