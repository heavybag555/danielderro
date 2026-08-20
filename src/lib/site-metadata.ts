import type { Metadata, Viewport } from "next";

/** Site name in mixed case for `<title>` and metadata. */
export const SITE_NAME = "Daniel Derro";

/**
 * Plain-text chevron for browser tab titles (`<title>` cannot render SVG).
 * Matches the site chevron mark used in UI.
 */
export const SITE_TITLE_MARK = "▸";

export const sitePageTitle = (page: string) =>
  `${SITE_NAME} ${SITE_TITLE_MARK} ${page}`;

export const SITE_DESCRIPTION =
  "Daniel Derro creates visual narratives for luxury fashion and cultural brands, bringing authentic street perspective to premium campaigns.";

/**
 * Absolute base for canonical URLs, Open Graph images, and the sitemap.
 * Vercel injects the deployment host; the production domain wins when set.
 */
export const SITE_URL = (() => {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
})();

export const rootSiteMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: sitePageTitle("%s"),
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

/** The canvas is black site-wide, so mobile browser chrome should match. */
export const rootSiteViewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};
