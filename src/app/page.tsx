import SiteFooter from "@/components/SiteFooter";
import InfoColumns from "@/components/InfoColumns";
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
    <div className="flex flex-col gap-2.5 px-[var(--spacing-margin)] pb-[calc(80px+env(safe-area-inset-bottom,0px))] pt-32 md:pt-48 lg:pt-[400px]">
      <div className="flex flex-col gap-16 md:gap-24 lg:gap-[120px]">
        <section className="pt-16 pb-0 md:pt-24 lg:pt-[120px]">
          <InfoColumns hideContact homeMobileAboutAboveHero />
          <div id="home-gallery-fade-anchor" className="mt-24 md:mt-40 lg:mt-[240px]">
            <GallerySection projects={projects} />
          </div>
        </section>

        <section className="py-16 md:py-24 lg:py-[120px]">
          <InfoColumns hideAboutClients contactMiddle hideHeroImage />
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}
