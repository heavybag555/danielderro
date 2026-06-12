import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectPage, { type Project } from "@/components/ProjectPage";
import { projectMediaItems } from "@/lib/project-media";
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

  if (!project) {
    return { title: "Work" };
  }

  return { title: project.title };
}

export default async function WorkProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await sanityFetchOrDefault<Project | null>(
    projectBySlugQuery,
    null,
    { slug },
  );

  if (!project) {
    notFound();
  }

  const preloadUrls = projectMediaItems(project)
    .slice(0, 3)
    .map((item) => projectSlideImageUrl(item.image));

  return (
    <>
      {preloadUrls.map((href) => (
        <link key={href} rel="preload" as="image" href={href} />
      ))}
      <ProjectPage project={project} />
    </>
  );
}
