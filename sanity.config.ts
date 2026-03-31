import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "@/sanity/schemas";
import { structure } from "@/sanity/structure";
import { projectId, dataset, apiVersion } from "@/sanity/env";

export default defineConfig({
  name: "danielderro",
  title: "Daniel Derro",
  projectId,
  dataset,
  apiVersion,
  basePath: "/studio",
  plugins: [structureTool({ structure })],
  schema: { types: schemaTypes },
});
