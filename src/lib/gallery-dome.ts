/** Tunable geometry of the gallery dome. */
export type DomeParams = {
  columns: number;
  tileWidth: number;
  gap: number;
  perspective: number;
  bulge: number;
  spread: number;
  curve: number;
  round: number;
  inertia: number;
};

/**
 * Dial spec: `[value, min, max, step]`. The first entry of each tuple is the
 * shipped value — production reads `GALLERY_DOME_PARAMS` and never loads the
 * dial UI, so `dialkit` stays out of the /gallery bundle.
 */
export const GALLERY_DOME_DIALS = {
  columns: [8, 3, 14, 1],
  tileWidth: [180, 96, 480, 1],
  gap: [40, 8, 80, 1],
  perspective: [2500, 500, 3600, 10],
  bulge: [690, 0, 900, 2],
  spread: [1, 0.15, 1, 0.01],
  curve: [0.23, 0, 2.5, 0.01],
  round: [0, 0, 64, 1],
  inertia: [0.9, 0.82, 0.985, 0.001],
} as const satisfies Record<keyof DomeParams, readonly [number, number, number, number]>;

export const GALLERY_DOME_ID = "gallery-dome-v3";

export const GALLERY_DOME_PARAMS: DomeParams = Object.fromEntries(
  Object.entries(GALLERY_DOME_DIALS).map(([key, spec]) => [key, spec[0]]),
) as DomeParams;
