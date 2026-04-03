import Image from "next/image";

function AboutBlock({ className }: { className?: string }) {
  return (
    <div className={["flex flex-col gap-5", className].filter(Boolean).join(" ")}>
      <div className="pl-5">
        <span className="text-caption" style={{ color: "var(--color-black)" }}>
          About
        </span>
      </div>
      <div className="flex flex-col gap-5">
        <p className="text-body" style={{ color: "var(--color-primary)", margin: 0 }}>
          Daniel Derro creates visual narratives for luxury fashion and cultural brands, bringing
          authentic street perspective to premium campaigns. His work for Prada, Dior, and Givenchy
          demonstrates his ability to translate genuine cultural moments into compelling luxury brand
          stories.
        </p>
        <div className="flex flex-col">
          <span className="text-meta" style={{ color: "var(--color-primary)" }}>
            Venice, California, USA
          </span>
          <span className="text-meta" style={{ color: "var(--color-primary)" }}>
            Nineteen Eighty Six
          </span>
        </div>
      </div>
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
};

export default function InfoColumns({
  hideContact = false,
  hideAboutClients = false,
  shiftRight = false,
  contactMiddle = false,
  hideHeroImage = false,
  homeMobileAboutAboveHero = false,
}: InfoColumnsProps) {
  const showAboutMobileFirst =
    homeMobileAboutAboveHero && !shiftRight && !hideAboutClients;

  const homeHeroStackedAboutClients =
    hideContact && homeMobileAboutAboveHero && !hideAboutClients;

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
        <>
          <div className="hidden lg:col-span-1 lg:block" aria-hidden />
        </>
      )}

      <div
        className={
          homeHeroStackedAboutClients
            ? "col-span-2 w-full min-w-0 md:col-span-2 md:col-start-1 lg:col-span-2 lg:col-start-2"
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
                src="/images/DEBT SS -105.jpg"
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
                src="/images/DEBT SS -105.jpg"
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
            ? "col-span-2 grid w-full min-w-0 grid-cols-1 gap-x-(--spacing-gutter) gap-y-0 md:col-span-2 md:col-start-3 md:grid-cols-subgrid lg:col-span-2 lg:col-start-4 lg:grid-cols-1 lg:gap-x-0"
            : "col-span-2 grid w-full min-w-0 grid-cols-1 gap-x-(--spacing-gutter) gap-y-5 md:col-span-2 md:col-start-3 md:grid-cols-subgrid lg:col-span-3 lg:col-start-4 lg:grid-cols-subgrid"
        }
      >
          {/* --- Slot 1 --- */}
          {shiftRight ? (
            <div />
          ) : hideAboutClients && contactMiddle ? (
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
                  <span className="text-body" style={{ color: "var(--color-primary)" }}>
                    info@ns-sr.org
                  </span>
                </div>
                <p className="text-meta-tight" style={{ color: "var(--color-primary)", margin: 0 }}>
                  Based between New York and Los Angeles with international project capabilities.
                </p>
              </div>
            </div>
          ) : hideAboutClients ? (
            <div />
          ) : homeHeroStackedAboutClients ? (
            <div className="min-w-0 md:col-span-2">
              <div className="flex flex-col gap-5 lg:gap-[40px]">
                {showAboutMobileFirst ? (
                  <div className="hidden md:block">
                    <AboutBlock />
                  </div>
                ) : (
                  <AboutBlock />
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ paddingLeft: 20 }}>
                    <span className="text-caption" style={{ color: "var(--color-black)" }}>
                      Clients
                    </span>
                  </div>
                  <p className="text-body" style={{ color: "var(--color-primary)", margin: 0 }}>
                    Prada, Nike, Givenchy, Dior, Stüssy, Adidas, pgLang, Burberry, Carhartt WIP, Our
                    Legacy, New Balance, Fake Mink, ASICS, Moncler, T Magazine, Giveon, Popeye,
                    Stormzy, Yeezy, Slam Jam, Converse, Alo, Nike Golf, Crash, Jordan, Union, Dazed,
                    Babylon, Neighborhood, Saint Laurent, Kaleidoscope, i-D, Interview Magazine
                  </p>
                </div>
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
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ paddingLeft: 20 }}>
                <span className="text-caption" style={{ color: "var(--color-black)" }}>
                  Follow
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span className="text-body" style={{ color: "var(--color-primary)" }}>
                  @danielderro_
                </span>
                <span className="text-body" style={{ color: "var(--color-primary)" }}>
                  @noschoolstudiorecords
                </span>
              </div>
            </div>
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
                  <span className="text-body" style={{ color: "var(--color-primary)" }}>
                    info@ns-sr.org
                  </span>
                </div>
                <p className="text-meta-tight" style={{ color: "var(--color-primary)", margin: 0 }}>
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
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span className="text-meta" style={{ color: "var(--color-primary)" }}>
                    Venice, California, USA
                  </span>
                  <span className="text-meta" style={{ color: "var(--color-primary)" }}>
                    Nineteen Eighty Six
                  </span>
                </div>
              </div>
            </div>
          ) : hideAboutClients ? (
            <div />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
          )}

          {/* --- Slot 3 (spans both sub-tracks on tablet so the row reads full-width) --- */}
          {contactMiddle && hideAboutClients ? (
            <div className="md:col-span-2 lg:col-span-1" aria-hidden />
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
                <span className="text-body" style={{ color: "var(--color-primary)" }}>
                  @danielderro_
                </span>
                <span className="text-body" style={{ color: "var(--color-primary)" }}>
                  @noschoolstudiorecords
                </span>
              </div>
            </div>
          )}
      </div>

      {homeHeroStackedAboutClients ? (
        <div className="hidden lg:col-span-1 lg:block lg:col-start-6" aria-hidden />
      ) : null}

    </div>
    </>
  );
}
