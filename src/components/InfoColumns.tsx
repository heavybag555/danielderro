import Image from "next/image";

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
};

export default function InfoColumns({
  hideContact = false,
  hideAboutClients = false,
  shiftRight = false,
  contactMiddle = false,
  hideHeroImage = false,
}: InfoColumnsProps) {
  const textGridStyle = {
    display: "grid" as const,
    gridTemplateColumns: "repeat(3, 1fr)",
    columnGap: "var(--spacing-gutter)",
    width: "100%",
  };

  return (
    <div className="page-grid">
      <div style={{ gridColumn: "1 / 2" }} />

      <div style={{ gridColumn: "2 / 3" }} />

      <div style={{ gridColumn: "3 / 4" }}>
        {!hideHeroImage && (
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
        )}
      </div>

      <div style={{ gridColumn: "4 / 7" }}>
        <div style={textGridStyle}>
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
          ) : (
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
          )}

          {/* --- Slot 2 --- */}
          {contactMiddle && hideAboutClients ? (
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

          {/* --- Slot 3 --- */}
          {contactMiddle && hideAboutClients ? (
            <div />
          ) : shiftRight ? (
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
          ) : hideContact ? (
            <div />
          ) : (
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
          )}
        </div>
      </div>

    </div>
  );
}
