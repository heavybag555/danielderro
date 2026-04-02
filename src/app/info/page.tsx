import SiteFooter from "@/components/SiteFooter";

export default function InfoPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        minHeight: "100vh",
        paddingLeft: "var(--spacing-margin)",
        paddingRight: "var(--spacing-margin)",
        gap: 10,
        background: "var(--color-white)",
      }}
    >
      <div className="flex flex-col gap-[120px] py-10 max-md:py-[120px] lg:justify-center lg:py-0">
        {/* About, body copy, Clients — desktop: 6-col grid; narrow: single column */}
        <div className="flex flex-col gap-20 lg:grid lg:grid-cols-6 lg:gap-x-(--spacing-gutter) lg:gap-y-0">
          <div className="hidden lg:col-span-1 lg:block" aria-hidden />

          <div className="flex flex-col gap-5 lg:col-span-1">
            <div style={{ paddingLeft: 20 }}>
              <span className="text-caption" style={{ color: "var(--color-black)" }}>
                About
              </span>
            </div>
            <div className="flex flex-col gap-5">
              <p className="text-body" style={{ color: "var(--color-primary)", margin: 0 }}>
                Daniel Derro creates visual narratives for luxury fashion and cultural brands,
                bringing authentic street perspective to premium campaigns. His work for Prada,
                Dior, and Givenchy demonstrates his ability to translate genuine cultural moments
                into compelling luxury brand stories.
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

          <div className="lg:col-span-1">
            <p
              className="text-body"
              style={{ color: "var(--color-primary)", margin: 0, whiteSpace: "pre-line" }}
            >
              {"Recent campaigns span major fashion houses, international sportswear brands, and music industry collaborations. Daniel has directed album visuals for Grammy-nominated artist Giveon while maintaining ongoing relationships with Nike and Adidas for culturally-driven campaigns.\n\nPublished extensively in The New York Times, Vogue Italia, i-D, and Kaleidoscope Magazine, Daniel\u2019s editorial work has been exhibited internationally from Dover Street Market Paris to MOMA and MOCA museums. His visual language combines documentary authenticity with luxury fashion aesthetics."}
            </p>
          </div>

          <div className="lg:col-span-1">
            <p
              className="text-body"
              style={{ color: "var(--color-primary)", margin: 0, whiteSpace: "pre-line" }}
            >
              {"Daniel\u2019s comprehensive services include photography, film direction, creative direction, casting, location scouting, and brand consulting. Working primarily with medium format film and high-end digital capture, he delivers complete creative solutions from concept through final delivery.\n\nHis artistic practice centers on social connection and community engagement, including work within correctional facilities and youth mentorship programs. This depth of human experience brings genuine authenticity to commercial work, creating campaigns that resonate beyond surface aesthetics."}
            </p>
          </div>

          <div className="flex flex-col gap-5 lg:col-span-1">
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

          <div className="hidden lg:col-span-1 lg:block" aria-hidden />
        </div>

        {/* Contact / Follow — desktop aligns to grid columns 4–5 */}
        <div className="page-grid">
          <div className="hidden lg:col-span-3 lg:block" aria-hidden />

          <div className="col-span-1 flex flex-col gap-5 md:col-span-2 lg:col-span-1 lg:col-start-4">
            <div style={{ paddingLeft: 20 }}>
              <span className="text-caption" style={{ color: "var(--color-black)" }}>
                Contact
              </span>
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col">
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

          <div className="col-span-1 flex flex-col gap-5 md:col-span-2 lg:col-span-1 lg:col-start-5">
            <div style={{ paddingLeft: 20 }}>
              <span className="text-caption" style={{ color: "var(--color-black)" }}>
                Follow
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-body" style={{ color: "var(--color-primary)" }}>
                @danielderro_
              </span>
              <span className="text-body" style={{ color: "var(--color-primary)" }}>
                @noschoolstudiorecords
              </span>
            </div>
          </div>

          <div className="hidden lg:col-span-1 lg:block" aria-hidden />
        </div>
      </div>

      <SiteFooter activePath="/info" />
    </div>
  );
}
