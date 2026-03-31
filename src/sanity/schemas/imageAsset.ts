import { defineField, defineType } from "sanity";

export const imageAssetType = defineType({
  name: "imageAsset",
  title: "Image",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
    }),
    defineField({
      name: "alt",
      title: "Alt Text",
      type: "string",
      description: "Describe the image for accessibility",
    }),
  ],
  preview: {
    select: {
      caption: "caption",
      media: "image",
    },
    prepare({ caption, media }) {
      return {
        title: caption || "Image",
        media,
      };
    },
  },
});
