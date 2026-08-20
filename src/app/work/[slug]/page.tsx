import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectPage, { type Project } from "@/components/ProjectPage";
import NoSchoolVideoPage from "@/components/NoSchoolVideoPage";
import { getNoSchoolVideoBySlug } from "@/lib/no-school-videos";
import { projectMediaItems } from "@/lib/project-media";
import { resolveVimeoStreamUrl } from "@/lib/vimeo-stream";
import { projectOgImageUrl, projectSlideImageUrl } from "@/sanity/lib/image";
import { sanityFetchOrDefault } from "@/sanity/lib/fetch-safe";
import { projectBySlugQuery } from "@/sanity/lib/queries";
import { SITE_NAME } from "@/lib/site-metadata";

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
    const description = `${project.title} — a project by ${SITE_NAME}.`;
    const media = projectMediaItems(project);
    const coverImage =
      media.find((item) => item.kind === "image")?.image ??
      media.find((item) => item.kind === "video")?.poster;
    const image = coverImage ? projectOgImageUrl(coverImage) : undefined;

    return {
      title: project.title,
      description,
      alternates: { canonical: `/work/${slug}` },
      openGraph: {
        title: project.title,
        description,
        url: `/work/${slug}`,
        ...(image
          ? { images: [{ url: image, width: 1200, height: 630, alt: project.title }] }
          : {}),
      },
      twitter: {
        card: "summary_large_image",
        title: project.title,
        description,
        ...(image ? { images: [image] } : {}),
      },
    };
  }

  const noSchool = getNoSchoolVideoBySlug(slug);
  if (noSchool) {
    const description = `${noSchool.title} — a No School Studio film.`;
    return {
      title: noSchool.title,
      description,
      alternates: { canonical: `/work/${slug}` },
      openGraph: {
        title: noSchool.title,
        description,
        url: `/work/${slug}`,
        images: [
          {
            url: noSchool.thumbnail,
            width: noSchool.width,
            height: noSchool.height,
            alt: noSchool.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: noSchool.title,
        description,
        images: [noSchool.thumbnail],
      },
    };
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
