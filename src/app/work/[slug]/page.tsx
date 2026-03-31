import { notFound } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { projectBySlugQuery } from "@/sanity/lib/queries";
import ProjectPage from "@/components/ProjectPage";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function WorkProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await client.fetch(projectBySlugQuery, { slug });

  if (!project) {
    notFound();
  }

  return <ProjectPage project={project} />;
}
