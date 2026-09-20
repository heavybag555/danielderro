import { ShopifyStorefrontError } from "./client";
import { isShopifyConfigured, shopifyConfigIssues } from "./env";
import { getProducts } from "./storefront";
import type { ShopifyProduct } from "./types";

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

export type ShopCatalog = {
  products: ShopifyProduct[];
  /** Caption for the empty state. Null when the grid has products. */
  notice: string | null;
};

const UNPUBLISHED_NOTICE =
  "Publish products to the Headless sales channel to show them here.";

function publicNotice(issues: string[], error?: ShopifyStorefrontError): string {
  const text = [...issues, error?.message ?? ""].join(" ");
  if (/empty/i.test(text)) {
    return "Add the Headless Storefront token to load products.";
  }
  if (/Admin|shpat_|rejected/i.test(text)) {
    return "Use the Headless public Storefront token, not an Admin key.";
  }
  if (/hex string|hostname/i.test(text)) {
    return "Store domain and Storefront token look swapped.";
  }
  if (error) return UNPUBLISHED_NOTICE;
  if (issues.length) return "Add the Headless Storefront token to load products.";
  return UNPUBLISHED_NOTICE;
}

/** Load the shop grid and keep a one-line reason when it is empty. */
export async function loadShopCatalog(first = 48): Promise<ShopCatalog> {
  const issues = shopifyConfigIssues();
  if (issues.length > 0) {
    return { products: [], notice: publicNotice(issues) };
  }

  try {
    const products = await getProducts({ first });
    if (products.length === 0) {
      return { products: [], notice: UNPUBLISHED_NOTICE };
    }
    return { products, notice: null };
  } catch (err) {
    console.error("[shopify] catalog failed:", err);
    return {
      products: [],
      notice: publicNotice(
        [],
        err instanceof ShopifyStorefrontError ? err : undefined,
      ),
    };
  }
}
