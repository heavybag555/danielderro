import { client } from "./client";

/**
 * Wraps Sanity fetches so CDN/API/network failures do not crash the whole route (500).
 */
export async function sanityFetchOrDefault<T>(
  query: string,
  defaultValue: T,
  params?: Record<string, unknown>,
): Promise<T> {
  try {
    return await client.fetch<T>(query, params ?? {});
  } catch (err) {
    console.error("[sanity] fetch failed:", err);
    return defaultValue;
  }
}
