/**
 * Tracks whether the user has performed an in-app (client-side) route change
 * since the initial hard document load. Used to decide whether entrance
 * animations (e.g. the work index row stagger) should run on a fresh load
 * but be skipped when arriving via a page transition.
 *
 * The flag lives at module scope so it persists across the SPA session and
 * resets only on a full page reload.
 */
let navigationOccurred = false;

export function markNavigationOccurred(): void {
  navigationOccurred = true;
}

export function hasNavigationOccurred(): boolean {
  return navigationOccurred;
}
