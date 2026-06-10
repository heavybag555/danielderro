import type { Metadata } from "next";

/** Site name in mixed case for `<title>` and metadata. */
export const SITE_NAME = "Daniel Derro";

/**
 * Plain-text chevron for browser tab titles (`<title>` cannot render SVG).
 * Matches the site chevron mark used in UI.
 */
export const SITE_TITLE_MARK = "▸";

export const sitePageTitle = (page: string) =>
  `${SITE_NAME} ${SITE_TITLE_MARK} ${page}`;

export const rootSiteMetadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: sitePageTitle("%s"),
  },
  description:
    "Daniel Derro creates visual narratives for luxury fashion and cultural brands, bringing authentic street perspective to premium campaigns.",
};
