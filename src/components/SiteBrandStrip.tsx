import Link from "next/link";
import { MobileMenuTrigger } from "@/components/MobileMenuOverlay";

const brandLink =
  "text-body no-underline opacity-100 transition-opacity duration-600 ease-[cubic-bezier(0.76,0,0.24,1)] hover:opacity-40";

/**
 * Fixed top band for Daniel Derro / Menu on light pages (home, info).
 * Visible at all breakpoints; replaces the previous bottom nav footer.
 */
export default function SiteBrandStrip() {
  const fg = "var(--color-black)";

  return (
    <div
      className="blend-overlay fixed top-0 right-0 left-0 z-200"
      style={{
        paddingLeft: "var(--spacing-margin)",
        paddingRight: "var(--spacing-margin)",
        paddingTop: "calc(var(--spacing-margin) + env(safe-area-inset-top, 0px))",
        paddingBottom: "var(--spacing-margin)",
        boxSizing: "border-box",
      }}
    >
      <div className="page-grid page-grid-nav-mobile items-start">
        <div className="col-span-2 flex gap-1 lg:col-span-6">
          <div className="flex min-w-0 flex-1 items-start">
            <Link href="/" className={brandLink} style={{ color: fg }}>
              Daniel Derro
            </Link>
          </div>
          <div className="flex min-w-0 flex-1 items-start justify-end">
            <MobileMenuTrigger triggerColor={fg} />
          </div>
        </div>
      </div>
    </div>
  );
}
