import { notFound } from "next/navigation";
import StudioClient from "./StudioClient";

export default function StudioPage() {
  if (process.env.SANITY_STUDIO_ENABLED !== "true") {
    notFound();
  }

  const projectId = process.env.SANITY_PROJECT_ID;
  if (!projectId) {
    throw new Error("SANITY_PROJECT_ID is not set.");
  }

  const dataset = process.env.SANITY_DATASET || "production";

  return <StudioClient projectId={projectId} dataset={dataset} />;
}
