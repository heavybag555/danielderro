import Link from "next/link";

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

export default function SiteFooter() {
  return (
    <footer className="page-grid" style={{ ...footerBar, alignItems: "center" }}>
      <div style={{ gridColumn: "1 / 3", display: "flex", alignItems: "flex-end", gap: 12 }}>
        <span className="text-h3" style={{ color: "var(--color-black)" }}>
          Daniel Derro
        </span>
      </div>

      <div style={{ gridColumn: "3 / 5", display: "flex", alignItems: "flex-end", gap: 12 }}>
        <span className="text-h3" style={{ color: "var(--color-black)" }}>
          No School Studios
        </span>
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
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="text-caption box-border flex min-w-0 flex-1 items-center justify-start border-[0.5px] border-(--color-stroke) px-1 py-0.5 text-(--color-black) no-underline hover:border-(--color-white) hover:bg-(--color-black) hover:text-(--color-white)"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
