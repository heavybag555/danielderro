import { sanityFetchOrDefault } from "@/sanity/lib/fetch-safe";
import { workPageProjectsQuery } from "@/sanity/lib/queries";
import WorkProjectGrid, {
  type WorkProject,
} from "@/components/WorkProjectGrid";

export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const projects = await sanityFetchOrDefault<WorkProject[]>(
    workPageProjectsQuery,
    [],
  );
  return <WorkProjectGrid projects={projects} />;
}
