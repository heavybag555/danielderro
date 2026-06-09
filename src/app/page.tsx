import HomeHero from "@/components/HomeHero";
import SitePageFooter from "@/components/SitePageFooter";
import GallerySection from "@/components/GallerySection";
import { sanityFetchOrDefault } from "@/sanity/lib/fetch-safe";

export const dynamic = "force-dynamic";

type SanityImageField = {
  asset: { _ref: string };
  hotspot?: { x: number; y: number };
};

type GalleryImage = {
  _type: "imageAsset";
  _key: string;
  image: SanityImageField;
  caption?: string;
  alt?: string;
};

type GalleryVideo = {
  _type: "videoAsset";
  _key: string;
  thumbnail?: SanityImageField;
  caption?: string;
  title?: string;
};

type GalleryEntry = GalleryImage | GalleryVideo;

type Project = {
  _id: string;
  title: string;
  slug: { current: string };
  client?: string;
  projectType: string;
  tags?: string[];
  coverImage?: { asset: { _ref: string } };
  gallery?: GalleryEntry[];
};

const projectWithGalleryQuery = `
  *[_type == "project"] | order(order asc, date desc) {
    _id,
    title,
    slug,
    client,
    projectType,
    tags,
    coverImage,
    gallery[] {
      _type,
      _key,
      image,
      caption,
      alt,
      thumbnail,
      title,
    },
  }
`;

export default async function Home() {
  const projects: Project[] = await sanityFetchOrDefault<Project[]>(
    projectWithGalleryQuery,
    [],
  );

  return (
    <>
      <HomeHero />
      <div className="flex flex-col px-[var(--spacing-margin)] pb-[120px]">
        <div id="home-gallery-fade-anchor">
          <GallerySection projects={projects} />
        </div>
        <SitePageFooter />
      </div>
    </>
  );
}
