"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  projectSlideLoader,
  sanityImageBlurUrl,
  sanityImageUrl,
} from "@/sanity/lib/image";
import { MOTION } from "@/lib/motion";
import type { ProjectSlideImageSource } from "@/lib/project-media";

type ProjectSlideImageProps = {
  image: ProjectSlideImageSource;
  alt: string;
  priority?: boolean;
  eager?: boolean;
};

const BLUR_FALLBACK_DELAY_MS = 120;

export default function ProjectSlideImage({
  image,
  alt,
  priority = false,
  eager = false,
}: ProjectSlideImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [showBlurFallback, setShowBlurFallback] = useState(Boolean(image.lqip));
  const reduceMotion = useReducedMotion();
  const mainSrc = sanityImageUrl(image);

  useEffect(() => {
    if (loaded || image.lqip) return;
    const id = window.setTimeout(
      () => setShowBlurFallback(true),
      BLUR_FALLBACK_DELAY_MS,
    );
    return () => window.clearTimeout(id);
  }, [image.lqip, loaded]);

  const showPlaceholder = !loaded && showBlurFallback;
  const placeholderSrc = image.lqip ?? sanityImageBlurUrl(image);

  return (
    <div className="project-slide-image">
      {showPlaceholder ? (
        <div aria-hidden className="project-slide-placeholder">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={placeholderSrc} alt="" decoding="async" />
        </div>
      ) : null}

      <motion.div
        className="project-slide-full"
        initial={false}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: MOTION.duration.gallerySlide, ease: MOTION.ease.out }
        }
      >
        <Image
          loader={projectSlideLoader}
          src={mainSrc}
          alt={alt}
          fill
          sizes="(max-width: 1920px) 100vw, 1920px"
          quality={75}
          priority={priority}
          loading={priority || eager ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : eager ? "auto" : "low"}
          onLoad={() => setLoaded(true)}
          style={{ objectFit: "contain" }}
        />
      </motion.div>
    </div>
  );
}
