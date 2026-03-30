import Image from "next/image";

const textGridStyle = {
  display: "grid" as const,
  gridTemplateColumns: "repeat(3, 1fr)",
  columnGap: "var(--spacing-gutter)",
  width: "100%",
};

type InfoColumnsProps = {
  /** When true, About / Clients / Contact stay pinned while the gallery scrolls. */
  stickyTextBlock?: boolean;
};

export default function InfoColumns({ stickyTextBlock = false }: InfoColumnsProps) {
  const rootShell = stickyTextBlock
    ? {
        position: "sticky" as const,
        top: 0,
        zIndex: 100,
      }
    : {};

  return (
    <div className="page-grid" style={rootShell}>
      <div style={{ gridColumn: "1 / 2" }}>
        <div style={{ width: "100%", height: 240, position: "relative", overflow: "hidden" }}>
          <Image
            src="/images/hero.png"
            alt="Daniel Derro"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
      </div>

      <div style={{ gridColumn: "2 / 3" }} />

      <div style={{ gridColumn: "3 / 6" }}>
        <div style={textGridStyle}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ paddingLeft: 20 }}>
              <span className="text-caption" style={{ color: "var(--color-black)" }}>
                About
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <p className="text-caption" style={{ color: "var(--color-primary)", margin: 0 }}>
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

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ paddingLeft: 20 }}>
              <span className="text-caption" style={{ color: "var(--color-black)" }}>
                Clients
              </span>
            </div>
            <p className="text-caption" style={{ color: "var(--color-primary)", margin: 0 }}>
              Prada, Nike, Givenchy, Dior, Stüssy, Adidas, pgLang, Burberry, Carhartt WIP, Our
              Legacy, New Balance, Fake Mink, ASICS, Moncler, T Magazine, Giveon, Popeye, Stormzy,
              Yeezy, Slam Jam, Converse, Alo, Nike Golf, Crash, Jordan, Union, Dazed, Babylon,
              Neighborhood, Saint Laurent, Kaleidoscope, i-D, Interview Magazine
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ paddingLeft: 20 }}>
              <span className="text-caption" style={{ color: "var(--color-black)" }}>
                Contact
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span className="text-caption" style={{ color: "var(--color-primary)" }}>
                  Tel. 00 32 15 75 59 43
                </span>
                <span className="text-caption" style={{ color: "var(--color-primary)" }}>
                  daniel@no-schoolstudio.org
                </span>
                <span className="text-caption" style={{ color: "var(--color-primary)" }}>
                  @danielderro_
                </span>
              </div>
              <p className="text-meta-tight" style={{ color: "var(--color-primary)", margin: 0 }}>
                Based between New York and Los Angeles with international project capabilities.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ gridColumn: "6 / 7" }} />
    </div>
  );
}
