import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/llms.md", "/llms-full.md"],
      // The embedded CMS and the player scratchpad are not public surfaces.
      disallow: ["/studio", "/studio/", "/radio-lab"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
