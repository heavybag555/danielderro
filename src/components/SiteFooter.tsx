import Link from "next/link";
import type { ReactNode } from "react";
import type { SiteNavItem } from "@/lib/site-nav";
import SiteNavComingSoonLabel from "@/components/SiteNavComingSoonLabel";

type SiteFooterProps = {
  activePath?: string;
  inverted?: boolean;
  leftContent?: ReactNode;
  middleContent?: ReactNode;
  rightContent?: ReactNode;
};

const NAV_ITEMS: SiteNavItem[] = [
  { label: "Info", href: "/info" },
  { label: "Work", href: "/work" },
  { label: "Exhibitions", href: "/exhibitions", comingSoon: true },
  { label: "Radio", href: "/radio", comingSoon: true },
];

const footerBar = {
  position: "fixed" as const,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 200,
  paddingLeft: "var(--spacing-margin)",
  paddingRight: "var(--spacing-margin)",
  paddingTop: "var(--spacing-margin)",
  paddingBottom: "var(--spacing-margin)",
  boxSizing: "border-box" as const,
};

const brandLink =
  "text-body no-underline opacity-100 transition-opacity duration-600 ease-[cubic-bezier(0.76,0,0.24,1)] hover:opacity-80";

function footerNavLinkClasses(
  active: boolean,
  inverted: boolean,
  comingSoon: boolean | undefined,
): string {
  const base =
    "hover-smooth text-caption box-border flex min-w-0 flex-1 items-center justify-start border-[0.5px] px-1 py-0.5 no-underline";
  if (comingSoon) {
    const group = `${base} group w-full cursor-default bg-transparent text-left font-inherit`;
    if (active) {
      return `${group} border-transparent ${
        inverted
          ? "bg-(--color-white) text-(--color-primary) hover:bg-(--color-primary) hover:text-(--color-white)"
          : "bg-(--color-black) text-(--color-white) hover:bg-(--color-primary) hover:text-(--color-white)"
      }`;
    }
    return `${group} ${
      inverted
        ? "border-(--color-white) text-(--color-white) hover:border-transparent hover:bg-(--color-primary) hover:text-(--color-white)"
        : "border-(--color-stroke) text-(--color-black) hover:border-transparent hover:bg-(--color-primary) hover:text-(--color-white)"
    }`;
  }
  return `${base} ${
    active
      ? inverted
        ? "border-transparent bg-(--color-white) text-(--color-primary)"
        : "border-transparent bg-(--color-black) text-(--color-white)"
      : inverted
        ? "border-(--color-white) text-(--color-white) hover:border-transparent hover:bg-(--color-white) hover:text-(--color-primary)"
        : "border-(--color-stroke) text-(--color-black) hover:border-transparent hover:bg-(--color-black) hover:text-(--color-white)"
  }`;
}

export default function SiteFooter({
  activePath,
  inverted = false,
  leftContent,
  middleContent,
  rightContent,
}: SiteFooterProps) {
  const fg = inverted ? "var(--color-white)" : "var(--color-black)";
  const isProjectFooter = leftContent !== undefined;

  return (
    <footer
      className={`page-grid ${!isProjectFooter ? "page-grid-nav-mobile" : ""} ${inverted ? "" : "blend-overlay"}`}
      style={{ ...footerBar, alignItems: "start" }}
    >
      {isProjectFooter ? (
        <>
          <div className="col-span-2 flex min-w-0 items-start justify-start md:col-span-1 lg:col-span-1">
            {leftContent}
          </div>
          <div className="col-span-1 flex min-w-0 items-start justify-start md:col-span-1 lg:col-span-1">
            {middleContent}
          </div>
          <div className="col-span-1 flex min-w-0 items-start justify-start md:col-span-1 lg:col-span-1">
            {rightContent}
          </div>
          <div className="hidden md:col-span-1 md:block lg:col-span-3" aria-hidden />
        </>
      ) : (
        <>
          <div className="col-span-2 flex gap-1 lg:contents">
            <div className="flex min-w-0 flex-1 items-start lg:col-span-2">
              <Link href="/" className={brandLink} style={{ color: fg }}>
                Daniel Derro
              </Link>
            </div>
            <div className="flex min-w-0 flex-1 items-start lg:col-span-2">
              <Link href="/" className={brandLink} style={{ color: fg }}>
                No-School Studio Records
              </Link>
            </div>
          </div>

          <nav className="col-span-2 flex min-w-0 items-stretch gap-1 max-lg:mt-[4px] lg:col-span-2">
            {NAV_ITEMS.map((item) => {
              const isActive = activePath === item.href;
              const className = footerNavLinkClasses(
                isActive,
                inverted,
                item.comingSoon,
              );
              const inner = item.comingSoon ? (
                <SiteNavComingSoonLabel label={item.label} />
              ) : (
                item.label
              );
              return item.comingSoon ? (
                <button key={item.label} type="button" className={className}>
                  {inner}
                </button>
              ) : (
                <Link key={item.label} href={item.href} className={className}>
                  {inner}
                </Link>
              );
            })}
          </nav>
        </>
      )}
    </footer>
  );
}
