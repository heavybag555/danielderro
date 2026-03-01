import { createClient, type SanityClient } from "next-sanity";

let _client: SanityClient | null = null;

export function getClient(): SanityClient {
  if (!_client) {
    const projectId = process.env.SANITY_PROJECT_ID;
    if (!projectId) {
      throw new Error(
        "SANITY_PROJECT_ID is not set. Add it to .env.local.",
      );
    }

    _client = createClient({
      projectId,
      dataset: process.env.SANITY_DATASET || "production",
      apiVersion: process.env.SANITY_API_VERSION || "2026-03-01",
      useCdn: true,
      perspective: "published",
    });
  }

  return _client;
}
