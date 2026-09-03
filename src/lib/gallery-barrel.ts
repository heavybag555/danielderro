import type { GalleryStill } from "@/lib/gallery-stills";

export type BarrelLayoutItem = {
  key: string;
  still: GalleryStill;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Vertical wrap period of this item's column (content + one gap). */
  periodY: number;
};

export type BarrelWorld = {
  items: BarrelLayoutItem[];
  /** Horizontal wrap period — includes the seam gap after the last column. */
  width: number;
  /** Smallest column period; sizes the vertical copy pool. */
  minPeriodY: number;
};

export type DomeOptics = {
  /** Crest height in px — translateZ at the viewport center. */
  bulge: number;
  /** Dome width as a fraction of the smaller viewport dimension. */
  spread: number;
  /** Rotation gain — 1 keeps tiles tangent to the dome surface. */
  curve: number;
  /** Corner radius at the crest, in px. */
  round: number;
};

export type ProjectedTile = {
  x: number;
  y: number;
  z: number;
  rotateX: number;
  rotateY: number;
  radius: number;
};

export function wrapCoord(n: number, size: number): number {
  if (size <= 0) return 0;
  return ((n % size) + size) % size;
}

/**
 * Masonry pack built for seamless wrapping: the horizontal period is
 * `cols * (width + gap)` so the seam between copies is exactly one gap, and
 * each column wraps at its own period (`stacked height + one gap`) so the
 * vertical seam is also exactly one gap in every column. Per-column periods
 * differ slightly, which drifts the columns against each other and keeps the
 * repetition from reading as a block.
 */
export function layoutGalleryBarrel(
  stills: GalleryStill[],
  columns: number,
  tileWidth: number,
  gap: number,
): BarrelWorld {
  const cols = Math.max(1, Math.floor(columns));
  const width = Math.max(8, tileWidth);
  const gutter = Math.max(0, gap);
  const colH = Array.from({ length: cols }, () => 0);
  const colOf: number[] = [];
  const items: BarrelLayoutItem[] = [];

  for (const still of stills) {
    const aspect = still.aspect > 0 ? still.aspect : 1;
    const col = colH.indexOf(Math.min(...colH));
    const h = width / aspect;
    colOf.push(col);
    items.push({
      key: still.key,
      still,
      x: col * (width + gutter),
      y: colH[col],
      w: width,
      h,
      periodY: 1,
    });
    // Trailing gutter doubles as the wrap-seam gap, making colH the period.
    colH[col] += h + gutter;
  }

  let minPeriodY = Infinity;
  items.forEach((item, i) => {
    item.periodY = Math.max(1, colH[colOf[i]]);
    if (item.periodY < minPeriodY) minPeriodY = item.periodY;
  });

  return {
    items,
    width: cols * (width + gutter),
    minPeriodY: Number.isFinite(minPeriodY) ? minPeriodY : 1,
  };
}

/**
 * How many toroidal copies are needed to cover the viewport in each axis.
 * Copy `c` renders at wrapped position + (c - 1) * period, so with sx0 in
 * [0, P) the copies span [-P, P * (copies - 1)). Vertical count is sized for
 * the shortest column period; longer columns just cull their spare copies.
 */
export function poolCopies(
  world: BarrelWorld,
  viewW: number,
  viewH: number,
): { x: number; y: number } {
  return {
    x: world.width > 0 ? Math.ceil(Math.max(1, viewW) / world.width) + 1 : 1,
    y:
      world.minPeriodY > 0
        ? Math.ceil(Math.max(1, viewH) / world.minPeriodY) + 1
        : 1,
  };
}

const DEG = 180 / Math.PI;
const MAX_TILT = 58;

function clampTilt(deg: number): number {
  return Math.max(-MAX_TILT, Math.min(MAX_TILT, deg));
}

/**
 * Place a tile tangent on a Gaussian dome bulging toward the camera at the
 * viewport center. z is the dome height at the tile's midpoint and the
 * rotations follow the analytic surface gradient, so tiles genuinely roll
 * onto the curved surface as they approach the crest (and the perspective
 * projection magnifies them there). Corner radius rises with dome height.
 */
export function projectDomeTile(
  sx: number,
  sy: number,
  tileW: number,
  tileH: number,
  viewW: number,
  viewH: number,
  optics: DomeOptics,
  flatten: boolean,
): ProjectedTile {
  if (flatten) {
    return { x: sx, y: sy, z: 0, rotateX: 0, rotateY: 0, radius: 0 };
  }

  const u = sx + tileW / 2 - viewW / 2;
  const v = sy + tileH / 2 - viewH / 2;
  const sigma = Math.max(1, Math.min(viewW, viewH) * optics.spread);
  const s2 = sigma * sigma;
  const g = Math.exp(-(u * u + v * v) / (2 * s2));
  // d(bulge * g)/du = -(bulge / s2) * u * g — the tangent slope of the dome.
  const slope = (optics.bulge / s2) * g;

  return {
    x: sx,
    y: sy,
    z: optics.bulge * g,
    // Tile below center: bottom edge falls away -> negative rotateX.
    rotateX: clampTilt(-Math.atan(slope * v) * DEG * optics.curve),
    // Tile right of center: right edge falls away -> positive rotateY.
    rotateY: clampTilt(Math.atan(slope * u) * DEG * optics.curve),
    radius: optics.round * g,
  };
}
