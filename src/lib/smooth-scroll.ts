/**
 * Desktop smooth scroll.
 *
 * Wheel input is intercepted and fed into a damped target; the real scroll
 * position glides toward it every frame. Because the engine writes to the
 * native scroll position (no transforms), fixed chrome, IntersectionObservers,
 * `scroll` listeners, and the site's minimal scrollbar all keep working.
 *
 * Anything the engine does not own stays native: keyboard scrolling,
 * scrollbar drags, anchor jumps, and Next's scroll-to-top on navigation are
 * detected as external moves and adopted as the new resting position.
 */

/** Only fine-pointer desktops that have not asked for reduced motion. */
export const SMOOTH_SCROLL_QUERY =
  "(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/**
 * Damping per 60fps frame (Lenis-style lerp). Lower is heavier. Converted to a
 * time-based coefficient in the loop so 120Hz displays feel identical.
 */
export const SMOOTH_SCROLL_LERP = 0.08;

/** Marks a nested scroller the engine must leave to the browser. */
export const SMOOTH_SCROLL_NATIVE_ATTR = "data-smooth-scroll-native";

/** Firefox reports wheel deltas in lines / pages on some configurations. */
const LINE_HEIGHT_PX = 100 / 6;

type ScrollRoot = Window | HTMLElement;

/** Time-based lerp: fraction of the remaining distance covered in `dt` seconds. */
export function dampingAlpha(lerpPerFrame: number, dt: number): number {
  return 1 - Math.pow(1 - lerpPerFrame, dt * 60);
}

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

function isScrollableY(node: HTMLElement): boolean {
  if (node.hasAttribute(SMOOTH_SCROLL_NATIVE_ATTR)) return true;
  if (node.scrollHeight <= node.clientHeight + 1) return false;
  const overflowY = window.getComputedStyle(node).overflowY;
  return overflowY === "auto" || overflowY === "scroll";
}

/**
 * True when the wheel event should be left to the browser: it is targeting a
 * vertical scroller nested inside `root` (radio lists, the project deck…).
 */
export function hasNestedScroller(event: WheelEvent, root: ScrollRoot): boolean {
  const stopAt: EventTarget =
    root === window ? document.documentElement : (root as HTMLElement);
  for (const node of event.composedPath()) {
    if (node === stopAt) break;
    if (node instanceof HTMLElement && isScrollableY(node)) return true;
  }
  return false;
}

export class SmoothScroll {
  private current = 0;
  private target = 0;
  private frame = 0;
  private lastTime = 0;
  private lastWritten = Number.NaN;
  private readonly lerp: number;

  constructor(
    private readonly root: ScrollRoot,
    options: { lerp?: number } = {},
  ) {
    this.lerp = options.lerp ?? SMOOTH_SCROLL_LERP;
    this.current = this.target = this.read();
    root.addEventListener("wheel", this.onWheel as EventListener, {
      passive: false,
    });
    root.addEventListener("scroll", this.onScroll, { passive: true });
  }

  destroy() {
    this.stop();
    this.root.removeEventListener("wheel", this.onWheel as EventListener);
    this.root.removeEventListener("scroll", this.onScroll);
  }

  /** Drop any in-flight glide and rest at the browser's current position. */
  reset() {
    this.stop();
    this.current = this.target = this.read();
    this.lastWritten = Number.NaN;
  }

  get isAnimating(): boolean {
    return this.frame !== 0;
  }

  private read(): number {
    return this.root === window
      ? window.scrollY
      : (this.root as HTMLElement).scrollTop;
  }

  private limit(): number {
    if (this.root === window) {
      return Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
    }
    const el = this.root as HTMLElement;
    return Math.max(0, el.scrollHeight - el.clientHeight);
  }

  private write(y: number) {
    this.lastWritten = y;
    if (this.root === window) {
      window.scrollTo(0, y);
    } else {
      (this.root as HTMLElement).scrollTop = y;
    }
  }

  private onScroll = () => {
    const y = this.read();
    // A move we did not write (keyboard, scrollbar, anchor, route change):
    // adopt it and let the browser finish natively.
    if (Number.isNaN(this.lastWritten) || Math.abs(y - this.lastWritten) > 1) {
      this.stop();
      this.current = this.target = y;
      this.lastWritten = y;
    }
  };

  private onWheel = (event: WheelEvent) => {
    // Pinch-zoom, or a surface (gallery dome, project deck) that owns its wheel.
    if (event.defaultPrevented || event.ctrlKey) return;

    const { dx, dy } = wheelDeltaPx(event);
    // Horizontal gestures belong to the strips / native axis handling.
    if (dy === 0 || Math.abs(dx) > Math.abs(dy)) return;
    if (hasNestedScroller(event, this.root)) return;

    event.preventDefault();

    const limit = this.limit();
    if (limit <= 0) return;

    if (!this.frame) {
      this.current = this.target = this.read();
    }
    this.target = Math.min(limit, Math.max(0, this.target + dy));
    this.start();
  };

  private start() {
    if (this.frame) return;
    this.lastTime = performance.now();
    this.frame = window.requestAnimationFrame(this.tick);
  }

  private stop() {
    if (this.frame) window.cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  private tick = (now: number) => {
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    // Content may have grown or shrunk since the gesture (lazy rows, images).
    this.target = Math.min(this.limit(), Math.max(0, this.target));

    this.current += (this.target - this.current) * dampingAlpha(this.lerp, dt);

    if (Math.abs(this.target - this.current) < 0.5) {
      this.current = this.target;
      this.write(this.current);
      this.frame = 0;
      return;
    }

    this.write(this.current);
    this.frame = window.requestAnimationFrame(this.tick);
  };
}
