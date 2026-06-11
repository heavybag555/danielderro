import HomeHero from "@/components/HomeHero";
import HomeIntroCopy from "@/components/HomeIntroCopy";
import SitePageFooter from "@/components/SitePageFooter";
import GallerySection from "@/components/GallerySection";
import {
  buildHomeGallery,
  HOME_GALLERY_FADE_ANCHOR_ID,
  type HomeGalleryProject,
} from "@/lib/home-gallery";
import { sanityFetchOrDefault } from "@/sanity/lib/fetch-safe";

export const dynamic = "force-dynamic";

const projectWithGalleryQuery = `
  *[_type == "project"] | order(order asc, date desc) {
    _id,
    title,
    slug,
    client,
    tags,
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
  const projects = await sanityFetchOrDefault<HomeGalleryProject[]>(
    projectWithGalleryQuery,
    [],
  );
  const stills = buildHomeGallery(projects);

  return (
    <>
      <HomeHero />
      <div className="site-page-bottom-padding flex flex-col px-[var(--spacing-margin)]">
        <HomeIntroCopy />
        <div id={HOME_GALLERY_FADE_ANCHOR_ID}>
          <GallerySection stills={stills} />
        </div>
        <SitePageFooter />
      </div>
    </>
  );
}
