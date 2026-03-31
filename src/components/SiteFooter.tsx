import Link from "next/link";

type SiteFooterProps = {
  activePath?: string;
  inverted?: boolean;
};

const NAV_ITEMS = [
  { label: "Info", href: "/info" },
  { label: "Work", href: "/work" },
  { label: "Exhibitions", href: "/exhibitions" },
  { label: "Radio", href: "/radio" },
] as const;

const footerBar = {
  position: "fixed" as const,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 200,
  paddingLeft: 12,
  paddingRight: 12,
  paddingTop: 12,
  paddingBottom: 12,
  boxSizing: "border-box" as const,
};

export default function SiteFooter({ activePath, inverted = false }: SiteFooterProps) {
  const fg = inverted ? "var(--color-white)" : "var(--color-black)";

  return (
    <footer className="page-grid" style={{ ...footerBar, alignItems: "center" }}>
      <div style={{ gridColumn: "1 / 3", display: "flex", alignItems: "flex-end", gap: 12 }}>
        <Link
          href="/"
          className="text-h3 no-underline opacity-100 transition-opacity duration-600 ease-[cubic-bezier(0.76,0,0.24,1)] hover:opacity-80"
          style={{ color: fg }}
        >
          Daniel Derro
        </Link>
      </div>

      <div style={{ gridColumn: "3 / 5", display: "flex", alignItems: "flex-end", gap: 12 }}>
        <Link
          href="/"
          className="text-h3 no-underline opacity-100 transition-opacity duration-600 ease-[cubic-bezier(0.76,0,0.24,1)] hover:opacity-80"
          style={{ color: fg }}
        >
          No-School Studio Records
        </Link>
      </div>

      <nav
        style={{
          gridColumn: "5 / 7",
          display: "flex",
          width: "100%",
          minWidth: 0,
          alignItems: "stretch",
          gap: 4,
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activePath === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`hover-smooth text-caption box-border flex min-w-0 flex-1 items-center justify-start border-[0.5px] px-1 py-0.5 no-underline ${
                isActive
                  ? inverted
                    ? "border-transparent bg-(--color-white) text-(--color-primary)"
                    : "border-transparent bg-(--color-black) text-(--color-white)"
                  : inverted
                    ? "border-(--color-white) text-(--color-white) hover:border-transparent hover:bg-(--color-white) hover:text-(--color-primary)"
                    : "border-(--color-stroke) text-(--color-black) hover:border-transparent hover:bg-(--color-black) hover:text-(--color-white)"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}
