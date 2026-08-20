import { NO_SCHOOL_VIDEOS } from "@/lib/no-school-videos";
import { sanityFetchOrDefault } from "@/sanity/lib/fetch-safe";
import { workPageProjectsQuery } from "@/sanity/lib/queries";
import GalleryIndex from "@/components/GalleryIndex";
import { buildGalleryStills } from "@/lib/gallery-stills";
import type { WorkProject } from "@/components/WorkProjectGrid";

export const dynamic = "force-dynamic";

function noSchoolWorkProjects(): WorkProject[] {
  return NO_SCHOOL_VIDEOS.map((video) => ({
    _id: `no-school-vimeo-${video.id}`,
    title: video.title,
    slug: { current: video.slug },
    projectType: "video",
    tags: ["no-school-studio"],
    externalCover: {
      src: video.thumbnail,
      width: video.width,
      height: video.height,
    },
  }));
}

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

  const ordered = [...projects, ...noSchoolWorkProjects()].sort(byUploadedAt);

  return <GalleryIndex stills={buildGalleryStills(ordered)} />;
}
