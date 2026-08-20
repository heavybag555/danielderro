import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-metadata";
import { sanityFetchOrDefault } from "@/sanity/lib/fetch-safe";
import { sitemapProjectsQuery } from "@/sanity/lib/queries";

type SitemapProject = {
  slug: string;
  _updatedAt?: string;
};

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const routes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, priority: 1 },
    { url: `${SITE_URL}/work`, lastModified: now, priority: 0.9 },
    { url: `${SITE_URL}/gallery`, lastModified: now, priority: 0.8 },
    { url: `${SITE_URL}/info`, lastModified: now, priority: 0.6 },
    { url: `${SITE_URL}/radio`, lastModified: now, priority: 0.6 },
  ];

  // A Sanity outage should degrade the sitemap, not fail the route.
  const projects = await sanityFetchOrDefault<SitemapProject[]>(
    sitemapProjectsQuery,
    [],
  );

  const projectRoutes: MetadataRoute.Sitemap = projects
    .filter((project) => Boolean(project.slug))
    .map((project) => ({
      url: `${SITE_URL}/work/${project.slug}`,
      lastModified: project._updatedAt ? new Date(project._updatedAt) : now,
      priority: 0.7,
    }));

  const seen = new Set<string>();
  return [...routes, ...projectRoutes].filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}
