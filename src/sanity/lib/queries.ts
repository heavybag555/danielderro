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
        image,
        caption,
        alt,
      },
      // videoAsset fields
      _type == "videoAsset" => {
        title,
        videoUrl,
        "videoFileUrl": videoFile.asset->url,
        thumbnail,
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
