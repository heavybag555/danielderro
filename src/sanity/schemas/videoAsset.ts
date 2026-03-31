import { defineField, defineType } from "sanity";
import { PlayIcon } from "@sanity/icons";

export const videoAssetType = defineType({
  name: "videoAsset",
  title: "Video",
  type: "object",
  icon: PlayIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
    }),
    defineField({
      name: "videoUrl",
      title: "Video URL",
      type: "url",
      description: "Vimeo or YouTube link",
      validation: (r) =>
        r.uri({ allowRelative: false, scheme: ["http", "https"] }),
    }),
    defineField({
      name: "videoFile",
      title: "Video File",
      type: "file",
      options: { accept: "video/*" },
      description: "Or upload a video file directly",
    }),
    defineField({
      name: "thumbnail",
      title: "Thumbnail",
      type: "image",
      options: { hotspot: true },
      description: "Preview image for the video",
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
    }),
  ],
  preview: {
    select: {
      title: "title",
      caption: "caption",
      media: "thumbnail",
    },
    prepare({ title, caption, media }) {
      return {
        title: title || caption || "Video",
        media: media || PlayIcon,
      };
    },
  },
});
