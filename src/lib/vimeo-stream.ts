/** Extract a Vimeo video id from a page URL or bare id. */
export function parseVimeoId(input: string): string | null {
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    if (!/(^|\.)vimeo\.com$/i.test(url.hostname)) return null;
    const parts = url.pathname.split("/").filter(Boolean);
    const id = parts.find((part) => /^\d+$/.test(part));
    return id ?? null;
  } catch {
    return null;
  }
}

type VimeoPlayFile = {
  link?: string;
  width?: number;
  height?: number;
  type?: string;
};

type VimeoPlayPayload = {
  play?: {
    progressive?: VimeoPlayFile[];
    hls?: { link?: string };
  };
};

/**
 * Resolve a direct progressive (or HLS) playback URL for SimplePlayer.
 * Requires `VIMEO_ACCESS_TOKEN` with access to the NO SCHOOL videos.
 */
export async function resolveVimeoStreamUrl(vimeoUrlOrId: string): Promise<string | null> {
  const id = parseVimeoId(vimeoUrlOrId);
  const token = process.env.VIMEO_ACCESS_TOKEN?.trim();
  if (!id || !token) return null;

  try {
    const response = await fetch(
      `https://api.vimeo.com/videos/${id}?fields=play.progressive,play.hls`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.vimeo.*+json;version=3.4",
        },
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) return null;

    const payload = (await response.json()) as VimeoPlayPayload;
    const progressive = payload.play?.progressive ?? [];
    const best = [...progressive].sort(
      (a, b) => (b.width ?? 0) - (a.width ?? 0),
    )[0];
    if (best?.link) return best.link;

    return payload.play?.hls?.link ?? null;
  } catch {
    return null;
  }
}
