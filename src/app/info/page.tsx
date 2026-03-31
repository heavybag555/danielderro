import SiteFooter from "@/components/SiteFooter";

export default function InfoPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100vh",
        paddingLeft: 12,
        paddingRight: 12,
        gap: 10,
        background: "var(--color-primary)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 120 }}>
        {/* About / Bio */}
        <div className="page-grid">
          <div style={{ gridColumn: "1 / 2" }} />

          <div style={{ gridColumn: "2 / 3", display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ paddingLeft: 20 }}>
              <span className="text-caption" style={{ color: "var(--color-black)" }}>
                About
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <p className="text-caption" style={{ color: "var(--color-white)", margin: 0 }}>
                Daniel Derro creates visual narratives for luxury fashion and cultural brands,
                bringing authentic street perspective to premium campaigns. His work for Prada,
                Dior, and Givenchy demonstrates his ability to translate genuine cultural moments
                into compelling luxury brand stories.
              </p>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span className="text-meta" style={{ color: "var(--color-white)" }}>
                  Venice, California, USA
                </span>
                <span className="text-meta" style={{ color: "var(--color-white)" }}>
                  Nineteen Eighty Six
                </span>
              </div>
            </div>
          </div>

          <div style={{ gridColumn: "3 / 4" }} />

          <div style={{ gridColumn: "4 / 5" }}>
            <p
              className="text-caption"
              style={{ color: "var(--color-white)", margin: 0, whiteSpace: "pre-line" }}
            >
              {"Recent campaigns span major fashion houses, international sportswear brands, and music industry collaborations. Daniel has directed album visuals for Grammy-nominated artist Giveon while maintaining ongoing relationships with Nike and Adidas for culturally-driven campaigns.\n\nPublished extensively in The New York Times, Vogue Italia, i-D, and Kaleidoscope Magazine, Daniel\u2019s editorial work has been exhibited internationally from Dover Street Market Paris to MOMA and MOCA museums. His visual language combines documentary authenticity with luxury fashion aesthetics."}
            </p>
          </div>

          <div style={{ gridColumn: "5 / 6" }}>
            <p
              className="text-caption"
              style={{ color: "var(--color-white)", margin: 0, whiteSpace: "pre-line" }}
            >
              {"Daniel\u2019s comprehensive services include photography, film direction, creative direction, casting, location scouting, and brand consulting. Working primarily with medium format film and high-end digital capture, he delivers complete creative solutions from concept through final delivery.\n\nHis artistic practice centers on social connection and community engagement, including work within correctional facilities and youth mentorship programs. This depth of human experience brings genuine authenticity to commercial work, creating campaigns that resonate beyond surface aesthetics."}
            </p>
          </div>

          <div style={{ gridColumn: "6 / 7" }} />
        </div>

        {/* Clients / Contact */}
        <div className="page-grid">
          <div style={{ gridColumn: "1 / 2" }} />

          <div style={{ gridColumn: "2 / 3", display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ paddingLeft: 20 }}>
              <span className="text-caption" style={{ color: "var(--color-black)" }}>
                Clients
              </span>
            </div>
            <p className="text-caption" style={{ color: "var(--color-white)", margin: 0 }}>
              Prada, Nike, Givenchy, Dior, Stüssy, Adidas, pgLang, Burberry, Carhartt WIP, Our
              Legacy, New Balance, Fake Mink, ASICS, Moncler, T Magazine, Giveon, Popeye, Stormzy,
              Yeezy, Slam Jam, Converse, Alo, Nike Golf, Crash, Jordan, Union, Dazed, Babylon,
              Neighborhood, Saint Laurent, Kaleidoscope, i-D, Interview Magazine
            </p>
          </div>

          <div style={{ gridColumn: "3 / 4" }} />

          <div style={{ gridColumn: "4 / 5", display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ paddingLeft: 20 }}>
              <span className="text-caption" style={{ color: "var(--color-black)" }}>
                Contact
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span className="text-caption" style={{ color: "var(--color-white)" }}>
                  Tel. 00 32 15 75 59 43
                </span>
                <span className="text-caption" style={{ color: "var(--color-white)" }}>
                  daniel@no-schoolstudio.org
                </span>
              </div>
              <p className="text-meta-tight" style={{ color: "var(--color-white)", margin: 0 }}>
                Based between New York and Los Angeles with international project capabilities.
              </p>
            </div>
          </div>

          <div style={{ gridColumn: "5 / 6", display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ paddingLeft: 20 }}>
              <span className="text-caption" style={{ color: "var(--color-black)" }}>
                Follow
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span className="text-caption" style={{ color: "var(--color-white)" }}>
                @danielderro_
              </span>
              <span className="text-caption" style={{ color: "var(--color-white)" }}>
                @noschoolstudiorecords
              </span>
            </div>
          </div>

          <div style={{ gridColumn: "6 / 7" }} />
        </div>
      </div>

      <SiteFooter activePath="/info" inverted />
    </div>
  );
}
