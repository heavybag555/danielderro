import Link from "next/link";
import { MobileMenuTrigger } from "@/components/MobileMenuOverlay";

const brandLink =
  "site-header-brand text-body no-underline opacity-100 transition-opacity duration-600 ease-[cubic-bezier(0.76,0,0.24,1)] hover:opacity-40";

function SiteHeaderMeta() {
  return (
    <div className="flex flex-col">
      <span className="text-micro site-header-meta">Venice, California, USA</span>
      <span className="text-micro site-header-meta">Nineteen Eighty Six</span>
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
    <div
      className="site-brand-strip fixed top-0 right-0 left-0"
      style={{
        paddingLeft: "var(--spacing-margin)",
        paddingRight: "var(--spacing-margin)",
        paddingTop: "calc(var(--spacing-margin) + env(safe-area-inset-top, 0px))",
        paddingBottom: "var(--spacing-margin)",
        boxSizing: "border-box",
      }}
    >
      <div className="page-grid relative max-md:gap-y-1 items-start">
        <div className="col-span-1 flex min-w-0 items-start">
          <Link href="/" className={`${brandLink}${blendClass}`}>
            Daniel Derro
          </Link>
        </div>

        <div
          className={`site-header-menu-cell col-span-1 col-start-2 flex min-w-0 items-start justify-end max-md:row-start-1 md:col-start-4 md:row-start-1 lg:col-start-6${blendClass}`}
        >
          <MobileMenuTrigger triggerColor="currentColor" />
        </div>

        <div
          className="hidden md:col-span-1 md:col-start-3 md:row-start-1 md:block lg:col-span-3 lg:col-start-3"
          aria-hidden
        />

        <div className="col-span-1 col-start-2 flex min-w-0 items-start max-md:row-start-2 md:row-start-1">
          <SiteHeaderMeta />
        </div>
      </div>
    </div>
  );
}
