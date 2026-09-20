/** Firefox reports wheel deltas in lines / pages on some configurations. */
const LINE_HEIGHT_PX = 100 / 6;

/** Normalise a wheel event to pixel deltas. */
export function wheelDeltaPx(event: WheelEvent): { dx: number; dy: number } {
  let dx = event.deltaX;
  let dy = event.deltaY;
  if (event.deltaMode === 1) {
    dx *= LINE_HEIGHT_PX;
    dy *= LINE_HEIGHT_PX;
  } else if (event.deltaMode === 2) {
    dx *= window.innerWidth;
    dy *= window.innerHeight;
  }
  return { dx, dy };
}
