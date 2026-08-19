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
  videoUrl?: string;
  videoFileUrl?: string;
  thumbnail?: ProjectSlideImageSource;
  caption?: string;
  title?: string;
};

type GalleryEntry = GalleryImage | GalleryVideo;

export type ProjectGallerySource = {
  gallery?: GalleryEntry[];
};

export type ProjectImageMediaItem = {
  kind: "image";
  _key: string;
  image: ProjectSlideImageSource;
  alt: string;
};

export type ProjectVideoMediaItem = {
  kind: "video";
  _key: string;
  src: string | null;
  videoUrl?: string;
  poster?: ProjectSlideImageSource;
  alt: string;
  aspectRatio?: string;
};

export type ProjectMediaItem = ProjectImageMediaItem | ProjectVideoMediaItem;

function aspectFromImage(image?: ProjectSlideImageSource): string | undefined {
  const dims = image?.dimensions;
  if (dims?.width && dims?.height) return `${dims.width} / ${dims.height}`;
  if (dims?.aspectRatio) return `${dims.aspectRatio} / 1`;
  return undefined;
}

export function projectMediaItems(project: ProjectGallerySource): ProjectMediaItem[] {
  const items: ProjectMediaItem[] = [];
  for (const entry of project.gallery ?? []) {
    if (entry._type === "imageAsset" && entry.image?.asset?._ref) {
      items.push({
        kind: "image",
        _key: entry._key,
        image: entry.image,
        alt: entry.alt?.trim() || entry.caption?.trim() || "",
      });
    } else if (entry._type === "videoAsset") {
      const src = entry.videoFileUrl?.trim() || null;
      const hasPoster = Boolean(entry.thumbnail?.asset?._ref);
      if (!src && !hasPoster) continue;
      items.push({
        kind: "video",
        _key: entry._key,
        src,
        videoUrl: entry.videoUrl,
        poster: hasPoster ? entry.thumbnail : undefined,
        alt: entry.caption?.trim() || entry.title?.trim() || "",
        aspectRatio: aspectFromImage(entry.thumbnail) ?? "16 / 9",
      });
    }
  }
  return items;
}
