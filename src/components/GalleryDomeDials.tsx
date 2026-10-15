"use client";

import { useEffect, useRef } from "react";
import { DialRoot, useDialKit } from "dialkit";
import "dialkit/styles.css";
import {
  GALLERY_DOME_DIALS,
  GALLERY_DOME_ID,
  type DomeParams,
} from "@/lib/gallery-dome";

/**
 * Development-only dial panel for the dome geometry. It is loaded through
 * `next/dynamic` so `dialkit` and its stylesheet stay out of the production
 * /gallery bundle; `GALLERY_DOME_PARAMS` carries the shipped values instead.
 */
export default function GalleryDomeDials({
  onChange,
}: {
  onChange: (params: DomeParams) => void;
}) {
  const params = useDialKit(
    "Gallery dome",
    GALLERY_DOME_DIALS as unknown as Record<string, [number, number, number, number]>,
    { id: GALLERY_DOME_ID, persist: true },
  );
  // `useDialKit` returns a fresh object every render; only report real moves.
  const last = useRef("");

  useEffect(() => {
    const serialized = JSON.stringify(params);
    if (serialized === last.current) return;
    last.current = serialized;
    onChange(params as DomeParams);
  }, [params, onChange]);

  return <DialRoot />;
}
