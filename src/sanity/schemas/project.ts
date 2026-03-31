import { defineField, defineType } from "sanity";

export const projectType = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "client",
      title: "Client",
      type: "string",
      description: "Who the project was for (leave blank for personal work)",
    }),
    defineField({
      name: "projectType",
      title: "Project Type",
      type: "string",
      options: {
        list: [
          { title: "Photography", value: "photography" },
          { title: "Video", value: "video" },
          { title: "Mixed", value: "mixed" },
        ],
        layout: "radio",
      },
      initialValue: "photography",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "No-School Studio Records", value: "no-school-studio" },
          { title: "Editorial", value: "editorial" },
          { title: "Campaign", value: "campaign" },
          { title: "Personal", value: "personal" },
        ],
      },
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
      description: "Main thumbnail for the project",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "date",
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [{ type: "imageAsset" }, { type: "videoAsset" }],
      description:
        "Grid stills on the site: photos as-is; videos use the thumbnail only (preview) until playback is added.",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Lower numbers appear first",
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: "Display Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
    {
      title: "Date (Newest)",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      client: "client",
      type: "projectType",
      tags: "tags",
      media: "coverImage",
    },
    prepare({ title, client, type, tags, media }) {
      const parts: string[] = [];
      if (type) parts.push(type.charAt(0).toUpperCase() + type.slice(1));
      if (client) parts.push(client);
      const isNoSchool = tags?.includes("no-school-studio");
      if (isNoSchool) parts.push("NSS");
      return {
        title,
        subtitle: parts.join(" · "),
        media,
      };
    },
  },
});
