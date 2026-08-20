const MARK_KEY = "dd-autoplay-sound";
const MARK_MS = 8000;

/** Call from the work/gallery click that opens a project. */
export function markUnmutedAutoplay() {
  try {
    sessionStorage.setItem(MARK_KEY, String(Date.now()));
  } catch {
    /* ignore quota / private mode */
  }
}

export function hasRecentUnmutedAutoplay(): boolean {
  try {
    const stamped = Number(sessionStorage.getItem(MARK_KEY) ?? "");
    return Number.isFinite(stamped) && Date.now() - stamped < MARK_MS;
  } catch {
    return false;
  }
}
