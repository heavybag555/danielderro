"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { NextStudio } from "next-sanity/studio";
import { schemaTypes } from "../../../../sanity/schemaTypes";

type StudioClientProps = {
  projectId: string;
  dataset: string;
};

export default function StudioClient({ projectId, dataset }: StudioClientProps) {
  const config = defineConfig({
    name: "danielderro",
    title: "Daniel Derro",
    projectId,
    dataset,
    basePath: "/studio",
    plugins: [structureTool()],
    schema: { types: schemaTypes },
  });

  return <NextStudio config={config} />;
}
