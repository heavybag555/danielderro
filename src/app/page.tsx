import SiteFooter from "@/components/SiteFooter";
import InfoColumns from "@/components/InfoColumns";
import GallerySection from "@/components/GallerySection";
import { client } from "@/sanity/lib/client";

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
  const projects: Project[] = await client.fetch(projectWithGalleryQuery);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        paddingTop: 220,
        paddingLeft: 12,
        paddingRight: 12,
        paddingBottom: "calc(80px + env(safe-area-inset-bottom, 0px))",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 120 }}>
        <section style={{ paddingTop: 120, paddingBottom: 0 }}>
          <InfoColumns stickyTextBlock />
          <div style={{ marginTop: 240 }}>
            <GallerySection projects={projects} />
          </div>
        </section>

        <section
          style={{
            paddingTop: 120,
            paddingBottom: 120,
          }}
        >
          <InfoColumns hideAboutClients />
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}
