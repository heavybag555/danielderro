import { sanityFetchOrDefault } from "@/sanity/lib/fetch-safe";
import { workPageProjectsQuery } from "@/sanity/lib/queries";
import GalleryIndex from "@/components/GalleryIndex";
import { buildGalleryStills } from "@/lib/gallery-stills";
import type { WorkProject } from "@/components/WorkProjectGrid";

export const dynamic = "force-dynamic";

function byUploadedAt(a: WorkProject, b: WorkProject): number {
  const left = a._createdAt ?? "";
  const right = b._createdAt ?? "";
  if (left && right) return right.localeCompare(left);
  if (left) return -1;
  if (right) return 1;
  return 0;
}

export default async function GalleryPage() {
  const projects = await sanityFetchOrDefault<WorkProject[]>(
    workPageProjectsQuery,
    [],
  );

  return (
    <GalleryIndex stills={buildGalleryStills([...projects].sort(byUploadedAt))} />
  );
}
