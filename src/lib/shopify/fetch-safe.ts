import { isShopifyConfigured } from "./env";

/**
 * Wraps Storefront reads so a missing shop or a Shopify outage degrades the
 * route instead of throwing a 500 — same idea as `sanityFetchOrDefault`.
 */
export async function shopifyFetchOrDefault<T>(
  load: () => Promise<T>,
  defaultValue: T,
): Promise<T> {
  if (!isShopifyConfigured()) return defaultValue;

  try {
    return await load();
  } catch (err) {
    console.error("[shopify] fetch failed:", err);
    return defaultValue;
  }
}
