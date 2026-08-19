import Link from "next/link";
import { MobileMenuTrigger, SiteNavLinks } from "@/components/MobileMenuOverlay";

const brandLink =
  "site-header-brand text-small no-underline opacity-100 transition-opacity duration-200 ease-[cubic-bezier(0.76,0,0.24,1)] hover:opacity-40";

export function SiteHeaderMeta() {
  const metaStyle = {
    color: "#ce0000",
    mixBlendMode: "normal" as const,
  };

  return (
    <div
      className="flex flex-col items-start gap-0"
      style={{ isolation: "isolate", mixBlendMode: "normal" }}
    >
      <span className="text-caption site-header-meta" style={metaStyle}>
        Venice, California, USA
      </span>
      <span className="text-caption site-header-meta" style={metaStyle}>
        Nineteen Eighty Six
      </span>
    </div>
  );
}

type SiteBrandStripProps = {
  /** Exclusion blend so header text stays legible over photography (home hero). */
  blendOverlay?: boolean;
};

/**
 * Fixed top band for Daniel Derro / location meta / Menu on all main surfaces.
 */
export default function SiteBrandStrip({ blendOverlay = false }: SiteBrandStripProps) {
  const blendClass = blendOverlay ? " blend-overlay" : "";

  return (
    <>
      <div
        className="site-brand-strip layout-full fixed top-0 right-0 left-0"
        style={{
          paddingTop: "calc(var(--spacing-margin) + env(safe-area-inset-top, 0px))",
          paddingBottom: "var(--spacing-margin)",
        }}
      >
        <div className="site-brand-strip-bar layout-grid">
          <div className="site-header-brand-cell min-w-0">
            <Link href="/" className={`${brandLink}${blendClass}`}>
              Daniel Derro
            </Link>
          </div>

          <div className={`site-header-nav-cell${blendClass}`}>
            <SiteNavLinks />
          </div>
        </div>
      </div>

      <div className="site-header-notch-cell">
        <MobileMenuTrigger />
      </div>
    </>
  );
}
