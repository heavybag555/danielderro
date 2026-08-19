import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectPage, { type Project } from "@/components/ProjectPage";
import NoSchoolVideoPage from "@/components/NoSchoolVideoPage";
import { getNoSchoolVideoBySlug } from "@/lib/no-school-videos";
import { projectMediaItems } from "@/lib/project-media";
import { resolveVimeoStreamUrl } from "@/lib/vimeo-stream";
import { projectSlideImageUrl } from "@/sanity/lib/image";
import { sanityFetchOrDefault } from "@/sanity/lib/fetch-safe";
import { projectBySlugQuery } from "@/sanity/lib/queries";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await sanityFetchOrDefault<Project | null>(
    projectBySlugQuery,
    null,
    { slug },
  );

  if (project) {
    return { title: project.title };
  }

  const noSchool = getNoSchoolVideoBySlug(slug);
  if (noSchool) {
    return { title: noSchool.title };
  }

  return { title: "Work" };
}

export default async function WorkProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await sanityFetchOrDefault<Project | null>(
    projectBySlugQuery,
    null,
    { slug },
  );

  if (project) {
    const mediaItems = projectMediaItems(project);
    const resolvedVideoSrcByKey: Record<string, string> = {};

    await Promise.all(
      mediaItems.map(async (item) => {
        if (item.kind !== "video") return;
        if (item.src) {
          resolvedVideoSrcByKey[item._key] = item.src;
          return;
        }
        if (!item.videoUrl) return;
        const stream = await resolveVimeoStreamUrl(item.videoUrl);
        if (stream) resolvedVideoSrcByKey[item._key] = stream;
      }),
    );

    const preloadUrls = mediaItems
      .slice(0, 3)
      .flatMap((item) => {
        if (item.kind === "image") return [projectSlideImageUrl(item.image)];
        if (item.poster) return [projectSlideImageUrl(item.poster)];
        return [];
      });

    return (
      <>
        {preloadUrls.map((href) => (
          <link key={href} rel="preload" as="image" href={href} />
        ))}
        <ProjectPage
          project={project}
          resolvedVideoSrcByKey={resolvedVideoSrcByKey}
        />
      </>
    );
  }

  const noSchool = getNoSchoolVideoBySlug(slug);
  if (!noSchool) {
    notFound();
  }

  const playbackSrc = await resolveVimeoStreamUrl(noSchool.vimeoUrl);

  return (
    <>
      <link rel="preload" as="image" href={noSchool.thumbnail} />
      <NoSchoolVideoPage video={noSchool} playbackSrc={playbackSrc} />
    </>
  );
}
