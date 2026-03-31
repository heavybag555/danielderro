import { client } from "@/sanity/lib/client";
import { workPageProjectsQuery } from "@/sanity/lib/queries";
import WorkProjectGrid from "@/components/WorkProjectGrid";

export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const projects = await client.fetch(workPageProjectsQuery);
  return <WorkProjectGrid projects={projects} />;
}
