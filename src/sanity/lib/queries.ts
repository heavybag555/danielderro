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

export const homeHeroProjectsQuery = groq`
  *[_type == "project"] | order(date desc, title asc) {
    _id,
    title,
    slug,
    client,
    projectType,
    tags,
    date,
    coverImage,
    "galleryThumb": coalesce(
      gallery[_type == "imageAsset" && defined(image.asset)][0].image,
      gallery[_type == "videoAsset" && defined(thumbnail.asset)][0].thumbnail
    ),
  }
`;

export const workPageProjectsQuery = groq`
  *[_type == "project"] | order(_createdAt desc) {
    _id,
    _createdAt,
    title,
    slug,
    client,
    projectType,
    tags,
    date,
    coverImage,
    "galleryThumbs": gallery[]{
      "image": coalesce(image, thumbnail)
    },
  }
`;

/** Slugs and modified stamps for the sitemap. */
export const sitemapProjectsQuery = groq`
  *[_type == "project" && defined(slug.current)] | order(_updatedAt desc) {
    "slug": slug.current,
    _updatedAt,
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
