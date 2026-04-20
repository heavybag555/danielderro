import SiteBrandStrip from "@/components/SiteBrandStrip";
import {
  SITE_CONTACT_EMAIL,
  SITE_CONTACT_MAILTO,
  SITE_INSTAGRAM_DANIEL_DERRO,
  SITE_INSTAGRAM_NO_SCHOOL_STUDIO_RECORDS,
} from "@/lib/site-contact";

export default function InfoPage() {
  return (
    <div
      className="max-w-full min-w-0 overflow-x-hidden pb-[120px] pt-[calc(var(--site-fixed-brand-strip-height)+120px)]"
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
      <SiteBrandStrip />
      <div className="flex min-w-0 max-w-full flex-col gap-[40px] lg:justify-center">
        <div className="flex flex-col gap-y-[40px] md:gap-y-[40px]">
          {/* About — lg: first block cols 3–4, second cols 5–6; cols 1–2 empty */}
          <div className="page-grid gap-y-[40px] md:gap-y-[40px] lg:gap-y-0">
            <div className="hidden lg:col-span-2 lg:col-start-1 lg:block" aria-hidden />

            <div className="col-span-2 flex flex-col gap-5 md:col-span-2 md:col-start-1 lg:col-span-2 lg:col-start-3">
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
                  <span className="text-micro" style={{ color: "var(--color-primary)" }}>
                    Venice, California, USA
                  </span>
                  <span className="text-micro" style={{ color: "var(--color-primary)" }}>
                    Nineteen Eighty Six
                  </span>
                </div>
                <p className="text-body" style={{ color: "var(--color-primary)", margin: 0 }}>
                  Recent campaigns span major fashion houses, international sportswear brands, and
                  music industry collaborations. Daniel has directed album visuals for
                  Grammy-nominated artist Giveon while maintaining ongoing relationships with Nike and
                  Adidas for culturally-driven campaigns.
                </p>
              </div>
            </div>

            <div className="col-span-2 md:col-span-2 md:col-start-3 lg:col-span-2 lg:col-start-5">
              <div className="flex flex-col gap-5 max-md:pt-5 md:pt-[calc(15px+1.25rem)]">
                <p className="text-body" style={{ color: "var(--color-primary)", margin: 0 }}>
                  Published extensively in The New York Times, Vogue Italia, i-D, and Kaleidoscope
                  Magazine, Daniel&apos;s editorial work has been exhibited internationally from Dover
                  Street Market Paris to MOMA and MOCA museums. His visual language combines
                  documentary authenticity with luxury fashion aesthetics.
                </p>
                <p className="text-body" style={{ color: "var(--color-primary)", margin: 0 }}>
                  Daniel&apos;s comprehensive services include photography, film direction, creative
                  direction, casting, location scouting, and brand consulting. Working primarily
                  with medium format film and high-end digital capture, he delivers complete creative
                  solutions from concept through final delivery.
                </p>
                <p className="text-body" style={{ color: "var(--color-primary)", margin: 0 }}>
                  His artistic practice centers on social connection and community engagement,
                  including work within correctional facilities and youth mentorship programs. This
                  depth of human experience brings genuine authenticity to commercial work, creating
                  campaigns that resonate beyond surface aesthetics.
                </p>
              </div>
            </div>
          </div>

          {/* Clients — lg: cols 3–4 (middle third); cols 1–2 and 5–6 empty */}
          <div className="page-grid">
            <div className="hidden lg:col-span-2 lg:col-start-1 lg:block" aria-hidden />

            <div className="col-span-2 flex flex-col gap-5 md:col-span-4 lg:col-span-2 lg:col-start-3">
              <div style={{ paddingLeft: 20 }}>
                <span className="text-caption" style={{ color: "var(--color-black)" }}>
                  Clients
                </span>
              </div>
              <p className="text-body wrap-break-word" style={{ color: "var(--color-primary)", margin: 0 }}>
                Prada, Nike, Givenchy, Dior, Stüssy, Adidas, pgLang, Burberry, Carhartt WIP, Our
                Legacy, New Balance, Fake Mink, ASICS, Moncler, T Magazine, Giveon, Popeye, Stormzy,
                Yeezy, Slam Jam, Converse, Alo, Nike Golf, Crash, Jordan, Union, Dazed, Babylon,
                Neighborhood, Saint Laurent, Kaleidoscope, i-D, Interview Magazine
              </p>
            </div>

            <div className="hidden lg:col-span-2 lg:col-start-5 lg:block" aria-hidden />
          </div>
        </div>

        {/* Contact / Follow — lg: Contact col 3, Follow col 4; cols 1–2 and 5–6 empty */}
        <div className="page-grid">
          <div className="hidden lg:col-span-2 lg:col-start-1 lg:block" aria-hidden />

          <div className="col-span-1 flex min-w-0 w-full max-w-full flex-col gap-5 wrap-break-word md:col-span-2 lg:col-span-1 lg:col-start-3">
            <div className="pl-5">
              <span className="text-caption" style={{ color: "var(--color-black)" }}>
                Contact
              </span>
            </div>
            <div className="flex min-w-0 w-full flex-col gap-5">
              <div className="flex min-w-0 flex-col">
                <span className="text-body wrap-break-word" style={{ color: "var(--color-primary)" }}>
                  Tel. 00 32 15 75 59 43
                </span>
                <a
                  href={SITE_CONTACT_MAILTO}
                  className="text-body hover-smooth no-underline hover:underline underline-offset-2 wrap-break-word"
                  style={{ color: "var(--color-primary)" }}
                >
                  {SITE_CONTACT_EMAIL}
                </a>
              </div>
              <p className="text-micro-tight wrap-break-word" style={{ color: "var(--color-primary)", margin: 0 }}>
                Based between New York and Los Angeles with international project capabilities.
              </p>
            </div>
          </div>

          <div className="col-span-1 flex min-w-0 w-full max-w-full flex-col gap-5 wrap-break-word md:col-span-2 lg:col-span-1 lg:col-start-4">
            <div className="pl-5">
              <span className="text-caption" style={{ color: "var(--color-black)" }}>
                Follow
              </span>
            </div>
            <div className="flex min-w-0 w-full flex-col">
              <a
                href={SITE_INSTAGRAM_DANIEL_DERRO}
                target="_blank"
                rel="noopener noreferrer"
                className="text-body hover-smooth no-underline hover:underline underline-offset-2 block wrap-break-word"
                style={{ color: "var(--color-primary)" }}
              >
                @danielderro_
              </a>
              <a
                href={SITE_INSTAGRAM_NO_SCHOOL_STUDIO_RECORDS}
                target="_blank"
                rel="noopener noreferrer"
                className="text-body hover-smooth no-underline hover:underline underline-offset-2 block wrap-break-word"
                style={{ color: "var(--color-primary)" }}
              >
                @noschoolstudiorecords
              </a>
            </div>
          </div>

          <div className="hidden lg:col-span-2 lg:col-start-5 lg:block" aria-hidden />
        </div>
      </div>
    </div>
  );
}
