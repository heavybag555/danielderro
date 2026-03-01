import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemaTypes";

const projectId = process.env.SANITY_PROJECT_ID!;
const dataset = process.env.SANITY_DATASET || "production";

export default defineConfig({
  name: "danielderro",
  title: "Daniel Derro",
  projectId,
  dataset,
  plugins: [structureTool()],
  schema: { types: schemaTypes },
});
