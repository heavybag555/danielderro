import { groq } from "next-sanity";

export const allProjectsQuery = groq`
  *[_type == "project"] | order(order asc, date desc) {
    _id,
    title,
    slug,
    client,
    projectType,
    tags,
    coverImage,
    description,
    date,
    "galleryCount": count(gallery),
  }
`;

export const projectBySlugQuery = groq`
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    client,
    projectType,
    tags,
    coverImage,
    description,
    date,
    gallery[] {
      _type,
      _key,
      // imageAsset fields
      _type == "imageAsset" => {
        image {
          ...,
          "lqip": asset->metadata.lqip,
          "dimensions": asset->metadata.dimensions,
        },
        caption,
        alt,
      },
      // videoAsset fields
      _type == "videoAsset" => {
        title,
        videoUrl,
        "videoFileUrl": videoFile.asset->url,
        thumbnail {
          ...,
          "lqip": asset->metadata.lqip,
          "dimensions": asset->metadata.dimensions,
        },
        caption,
      },
    },
  }
`;

export const photographyProjectsQuery = groq`
  *[_type == "project" && projectType == "photography"] | order(order asc, date desc) {
    _id,
    title,
    slug,
    client,
    tags,
    coverImage,
    "galleryCount": count(gallery),
  }
`;

export const videoProjectsQuery = groq`
  *[_type == "project" && projectType == "video"] | order(order asc, date desc) {
    _id,
    title,
    slug,
    client,
    tags,
    coverImage,
    "galleryCount": count(gallery),
  }
`;

export const workPageProjectsQuery = groq`
  *[_type == "project"] | order(order asc, date desc) {
    _id,
    title,
    slug,
    client,
    projectType,
    tags,
    coverImage,
    "galleryThumbs": gallery[]{
      "image": coalesce(image, thumbnail)
    },
  }
`;

export const noSchoolStudioQuery = groq`
  *[_type == "project" && "no-school-studio" in tags] | order(order asc, date desc) {
    _id,
    title,
    slug,
    client,
    projectType,
    tags,
    coverImage,
    "galleryCount": count(gallery),
  }
`;
