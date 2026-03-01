import { groq } from "next-sanity";

export const allPhotosQuery = groq`
  *[_type == "photo"] | order(date desc) {
    _id,
    title,
    caption,
    clientName,
    date,
    credits,
    location,
    tags,
    "imageRef": image.asset._ref
  }
`;

export const projectListQuery = groq`
  *[_type == "project"] | order(date desc, _createdAt desc) {
    _id,
    name,
    "slug": slug.current,
    clientName,
    date,
    description,
    "coverImageRef": coverImage.asset._ref,
    "photoCount": count(photos)
  }
`;

export const projectBySlugQuery = groq`
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    clientName,
    date,
    description,
    "coverImageRef": coverImage.asset._ref,
    photos[]-> {
      _id,
      title,
      caption,
      clientName,
      date,
      credits,
      location,
      tags,
      "imageRef": image.asset._ref
    }
  }
`;
