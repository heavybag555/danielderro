import { sanityFetch, buildImageUrl, projectListQuery } from "@/lib/sanity";
import HomeClient from "./HomeClient";

type ProjectSummary = {
  _id: string;
  name: string;
  clientName: string;
  coverImageRef: string | null;
};

const COLLABORATOR_SEARCH: Record<string, string[]> = {
  Prada: ["prada"],
  Nike: ["nike"],
  Givenchy: ["givenchy"],
  Dior: ["dior"],
  Stüssy: ["stussy", "stüssy"],
  Adidas: ["adidas"],
  pgLang: ["pglang", "pg lang"],
  Burberry: ["burberry"],
  "Carhartt WIP": ["carhartt"],
  "Our Legacy": ["our legacy"],
  "New Balance": ["new balance"],
  Giveon: ["giveon"],
  "Dover Street Market Paris": ["dover street market"],
};

export default async function Home() {
  if (!process.env.SANITY_PROJECT_ID) {
    return <HomeClient collaboratorImages={{}} />;
  }

  const projects = await sanityFetch<ProjectSummary[]>(projectListQuery);

  const collaboratorImages: Record<string, string> = {};

  for (const [displayName, terms] of Object.entries(COLLABORATOR_SEARCH)) {
    const project = projects.find((p) => {
      const name = (p.name || "").toLowerCase();
      const client = (p.clientName || "").toLowerCase();
      return terms.some((t) => name.includes(t) || client.includes(t));
    });
    if (project?.coverImageRef) {
      collaboratorImages[displayName] = buildImageUrl(project.coverImageRef, {
        width: 400,
      });
    }
  }

  return <HomeClient collaboratorImages={collaboratorImages} />;
}
