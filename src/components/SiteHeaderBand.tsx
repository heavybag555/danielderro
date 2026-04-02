import Link from "next/link";
import type { SiteNavItem } from "@/lib/site-nav";
import SiteNavComingSoonLabel from "@/components/SiteNavComingSoonLabel";

type SiteHeaderBandProps = {
  navItems: SiteNavItem[];
  isActive: (item: SiteNavItem) => boolean;
  variant: "dark" | "light";
};

const brandLink =
  "text-body no-underline opacity-100 transition-opacity duration-600 ease-[cubic-bezier(0.76,0,0.24,1)] hover:opacity-80";

function headerNavLinkClasses(
  active: boolean,
  variant: "dark" | "light",
  comingSoon: boolean | undefined,
): string {
  const base =
    "hover-smooth text-caption box-border flex min-w-0 flex-1 items-center justify-start border-[0.5px] px-1 py-0.5 no-underline";
  if (comingSoon) {
    const group = `${base} group w-full cursor-default bg-transparent text-left font-inherit`;
    if (active) {
      return `${group} border-transparent ${
        variant === "dark"
          ? "bg-(--color-white) text-(--color-black) hover:bg-(--color-primary) hover:text-(--color-white)"
          : "bg-(--color-black) text-(--color-white) hover:bg-(--color-primary) hover:text-(--color-white)"
      }`;
    }
    return `${group} ${
      variant === "dark"
        ? "border-(--color-white) text-(--color-white) hover:border-transparent hover:bg-(--color-primary) hover:text-(--color-white)"
        : "border-(--color-stroke) text-(--color-black) hover:border-transparent hover:bg-(--color-primary) hover:text-(--color-white)"
    }`;
  }
  const navInactive =
    variant === "dark"
      ? "border-(--color-white) text-(--color-white) hover:border-transparent hover:bg-(--color-white) hover:text-(--color-black)"
      : "border-(--color-stroke) text-(--color-black) hover:border-transparent hover:bg-(--color-black) hover:text-(--color-white)";
  const navActive =
    variant === "dark"
      ? "border-transparent bg-(--color-white) text-(--color-black)"
      : "border-transparent bg-(--color-black) text-(--color-white)";
  return `${base} ${active ? navActive : navInactive}`;
}

export default function SiteHeaderBand({
  navItems,
  isActive,
  variant,
}: SiteHeaderBandProps) {
  const fg = variant === "dark" ? "var(--color-white)" : "var(--color-black)";

  return (
    <header className="page-grid page-grid-nav-mobile shrink-0 items-center">
      <div className="col-span-2 flex gap-1 lg:contents">
        <div className="flex min-w-0 flex-1 items-end lg:col-span-2">
          <Link href="/" className={brandLink} style={{ color: fg }}>
            Daniel Derro
          </Link>
        </div>
        <div className="flex min-w-0 flex-1 items-end lg:col-span-2">
          <Link href="/" className={brandLink} style={{ color: fg }}>
            No-School Studio Records
          </Link>
        </div>
      </div>

      <nav className="col-span-2 flex min-w-0 items-stretch gap-1 max-lg:mt-[4px] lg:col-span-2">
        {navItems.map((item) => {
          const active = isActive(item);
          const className = headerNavLinkClasses(
            active,
            variant,
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
    </header>
  );
}
