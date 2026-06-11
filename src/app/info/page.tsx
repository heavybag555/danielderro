import type { Metadata } from "next";
import Image from "next/image";

import SitePageFooter from "@/components/SitePageFooter";
import { HERO_STACK_PORTRAIT, SITE_CLIENTS_COPY } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Info",
};

export default function InfoPage() {
  return (
    <div
      className="site-page-content-offset site-page-bottom-padding max-w-full min-w-0 overflow-x-hidden"
      style={{
        display: "flex",
        flexDirection: "column",
        paddingLeft: "var(--spacing-margin)",
        paddingRight: "var(--spacing-margin)",
        gap: 10,
        background: "var(--color-white)",
      }}
    >
      <div className="info-page">
        <div className="info-page-images">
          <div className="info-page-image">
            <Image
              src="/images/daniel-hero-new.jpg"
              alt="Daniel Derro"
              width={2000}
              height={1470}
              className="info-page-image-el"
              priority
            />
          </div>

          <div className="info-page-image">
            <Image
              src={HERO_STACK_PORTRAIT.src}
              alt={HERO_STACK_PORTRAIT.alt}
              width={HERO_STACK_PORTRAIT.width}
              height={HERO_STACK_PORTRAIT.height}
              className="info-page-image-el"
              priority
            />
          </div>
        </div>

        <div className="info-page-copy flex flex-col gap-[40px]">
          <section className="flex flex-col gap-0" style={{ color: "var(--color-primary)" }}>
            <h2 className="text-semantic-title pl-5">About</h2>
            <div className="flex flex-col gap-5">
              <p className="text-body" style={{ color: "var(--color-primary)", margin: 0 }}>
                Daniel Derro creates visual narratives for luxury fashion and cultural brands,
                bringing authentic street perspective to premium campaigns. His work for Prada,
                Dior, and Givenchy demonstrates his ability to translate genuine cultural moments
                into compelling luxury brand stories.
              </p>
              <p className="text-body" style={{ color: "var(--color-primary)", margin: 0 }}>
                Recent campaigns span major fashion houses, international sportswear brands, and
                music industry collaborations. Daniel has directed album visuals for
                Grammy-nominated artist Giveon while maintaining ongoing relationships with Nike and
                Adidas for culturally-driven campaigns.
              </p>
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
          </section>

          <section className="flex flex-col gap-0" style={{ color: "var(--color-primary)" }}>
            <h2 className="text-semantic-title pl-5">Clients</h2>
            <p className="text-body" style={{ color: "var(--color-primary)", margin: 0 }}>
              {SITE_CLIENTS_COPY}
            </p>
          </section>
        </div>
      </div>

      <SitePageFooter />
    </div>
  );
}
