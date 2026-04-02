import { notFound } from "next/navigation";
import { sanityFetchOrDefault } from "@/sanity/lib/fetch-safe";
import { projectBySlugQuery } from "@/sanity/lib/queries";
import ProjectPage, { type Project } from "@/components/ProjectPage";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

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

  return <ProjectPage project={project} />;
}
