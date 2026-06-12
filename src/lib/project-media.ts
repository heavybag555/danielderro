export type ProjectSlideImageSource = {
  asset: { _ref: string };
  hotspot?: { x: number; y: number };
  lqip?: string;
  dimensions?: { width: number; height: number; aspectRatio?: number };
};

type GalleryImage = {
  _type: "imageAsset";
  _key: string;
  image: ProjectSlideImageSource;
  caption?: string;
  alt?: string;
};

type GalleryVideo = {
  _type: "videoAsset";
  _key: string;
  thumbnail?: ProjectSlideImageSource;
  caption?: string;
  title?: string;
};

type GalleryEntry = GalleryImage | GalleryVideo;

export type ProjectGallerySource = {
  gallery?: GalleryEntry[];
};

export type ProjectMediaItem = {
  _key: string;
  image: ProjectSlideImageSource;
  alt: string;
};

export function projectMediaItems(project: ProjectGallerySource): ProjectMediaItem[] {
  const items: ProjectMediaItem[] = [];
  for (const entry of project.gallery ?? []) {
    if (entry._type === "imageAsset" && entry.image?.asset?._ref) {
      items.push({
        _key: entry._key,
        image: entry.image,
        alt: entry.alt?.trim() || entry.caption?.trim() || "",
      });
    } else if (entry._type === "videoAsset" && entry.thumbnail?.asset?._ref) {
      items.push({
        _key: entry._key,
        image: entry.thumbnail,
        alt: entry.caption?.trim() || entry.title?.trim() || "",
      });
    }
  }
  return items;
}
