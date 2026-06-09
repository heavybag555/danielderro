type SnugFillImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
};

/**
 * Width-fills the parent column span; height tracks intrinsic aspect ratio with no crop.
 */
export default function SnugFillImage({
  src,
  alt,
  width,
  height,
  priority = false,
}: SnugFillImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      className="block h-auto w-full max-w-full object-contain"
      style={{ objectFit: "contain" }}
    />
  );
}
