import type { StructureBuilder } from "sanity/structure";

export const structure = (S: StructureBuilder) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("All Projects")
        .schemaType("project")
        .child(S.documentTypeList("project").title("All Projects")),

      S.divider(),

      S.listItem()
        .title("Photography")
        .child(
          S.documentTypeList("project")
            .title("Photography")
            .filter('_type == "project" && projectType == "photography"')
        ),

      S.listItem()
        .title("Video")
        .child(
          S.documentTypeList("project")
            .title("Video")
            .filter('_type == "project" && projectType == "video"')
        ),

      S.listItem()
        .title("Mixed")
        .child(
          S.documentTypeList("project")
            .title("Mixed")
            .filter('_type == "project" && projectType == "mixed"')
        ),

      S.divider(),

      S.listItem()
        .title("No-School Studio Records")
        .child(
          S.documentTypeList("project")
            .title("No-School Studio Records")
            .filter(
              '_type == "project" && "no-school-studio" in tags'
            )
        ),
    ]);
