const DECRYPTION_KEY = "IFYOUWANTTHEARTISTSTOGETPAIDDONOTDOWNLOADFROMMIXCLOUD";

function sanitizeSegment(value: string): string {
  if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
    throw new Error("Invalid Mixcloud path segment");
  }
  return value;
}

export function parseMixcloudUrl(mixcloudUrl: string): { username: string; slug: string } {
  const { pathname } = new URL(mixcloudUrl);
  const [username, slug] = pathname.split("/").filter(Boolean);
  if (!username || !slug) {
    throw new Error("Invalid Mixcloud URL");
  }
  return {
    username: sanitizeSegment(decodeURIComponent(username)),
    slug: sanitizeSegment(decodeURIComponent(slug)),
  };
}

function decryptStreamUrl(encoded: string): string {
  const bytes = Buffer.from(encoded, "base64");
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += String.fromCharCode(bytes[i]! ^ DECRYPTION_KEY.charCodeAt(i % DECRYPTION_KEY.length));
  }
  return out;
}

/** Resolve a direct progressive stream URL for a public Mixcloud show page. */
export async function resolveMixcloudStreamUrl(mixcloudUrl: string): Promise<string | null> {
  try {
    const { username, slug } = parseMixcloudUrl(mixcloudUrl);
    const response = await fetch("https://app.mixcloud.com/graphql", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        query: `query {
          cloudcastLookup(lookup: { username: "${username}", slug: "${slug}" }) {
            streamInfo { url }
          }
        }`,
      }),
      next: { revalidate: 3600 },
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as {
      data?: { cloudcastLookup?: { streamInfo?: { url?: string } | null } | null };
    };

    const encoded = payload.data?.cloudcastLookup?.streamInfo?.url;
    if (!encoded) return null;

    return decryptStreamUrl(encoded);
  } catch {
    return null;
  }
}
