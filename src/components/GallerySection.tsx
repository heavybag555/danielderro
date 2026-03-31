import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

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

type Props = {
  projects: Project[];
};

type PreviewStill = {
  _key: string;
  image: SanityImageField;
  alt: string;
};

function galleryEntriesToPreviewStills(entries: GalleryEntry[]): PreviewStill[] {
  const out: PreviewStill[] = [];
  for (const entry of entries) {
    if (entry._type === "imageAsset" && entry.image) {
      out.push({
        _key: entry._key,
        image: entry.image,
        alt: entry.alt?.trim() || entry.caption?.trim() || "",
      });
      continue;
    }
    if (entry._type === "videoAsset" && entry.thumbnail) {
      out.push({
        _key: entry._key,
        image: entry.thumbnail,
        alt: entry.caption?.trim() || entry.title?.trim() || "",
      });
    }
  }
  return out;
}

function ProjectImages({ items }: { items: PreviewStill[] }) {
  const columns: PreviewStill[][] = [[], [], [], [], [], []];
  items.forEach((img, i) => {
    columns[i % 6].push(img);
  });

  return (
    <div className="page-grid" style={{ alignItems: "start" }}>
      {columns.map((col, colIdx) => (
        <div
          key={colIdx}
          style={{
            gridColumn: `${colIdx + 1} / ${colIdx + 2}`,
            display: "flex",
            flexDirection: "column",
            gap: 120,
          }}
        >
          {col.map((item) => (
            <div
              key={item._key}
              style={{
                width: "100%",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Image
                src={urlFor(item.image).width(600).quality(85).auto("format").url()}
                alt={item.alt}
                width={600}
                height={750}
                sizes="(max-width: 768px) 50vw, 16vw"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function GallerySection({ projects }: Props) {
  const allStills = projects.flatMap((p) =>
    galleryEntriesToPreviewStills(p.gallery ?? [])
  );

  if (allStills.length === 0) {
    return null;
  }

  return (
    <section>
      <ProjectImages items={allStills} />
    </section>
  );
}
