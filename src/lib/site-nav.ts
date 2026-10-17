export type SiteNavItem = {
  label: string;
  href: string;
  comingSoon?: boolean;
};

/** Public pages in nav order — shared by the header nav and the agent text routes. */
export const SITE_NAV_ITEMS: readonly SiteNavItem[] = [
  { label: "Work", href: "/work" },
  { label: "Gallery", href: "/gallery" },
  { label: "Info", href: "/info" },
  { label: "Radio", href: "/radio" },
];
