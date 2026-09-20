import { ShopifyStorefrontError } from "./client";
import { isShopifyConfigured, shopifyDomainIssues } from "./env";
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

const DOMAIN_NOTICE = "Add the store domain to load products.";
const LOCKED_NOTICE = "Remove the store password to load products.";
const REJECTED_NOTICE = "Use the Headless public Storefront token, not an Admin key.";
const SWAPPED_NOTICE = "Store domain and Storefront token look swapped.";
const EMPTY_NOTICE = "No products are published to this storefront.";

function publicNotice(issues: string[], error?: ShopifyStorefrontError): string {
  if (error?.code === "locked" || /locked/i.test(error?.message ?? "")) {
    return LOCKED_NOTICE;
  }
  if (error?.code === "unauthorized" || /rejected/i.test(error?.message ?? "")) {
    return REJECTED_NOTICE;
  }

  const text = [...issues, error?.message ?? ""].join(" ");
  if (/hex string|hostname/i.test(text) && /token/i.test(text)) {
    return SWAPPED_NOTICE;
  }
  if (/empty/i.test(text) && /DOMAIN/i.test(text)) {
    return DOMAIN_NOTICE;
  }
  if (/Admin|shpat_/i.test(text)) {
    return REJECTED_NOTICE;
  }
  if (issues.length && !error) return DOMAIN_NOTICE;
  return EMPTY_NOTICE;
}

/** Load the shop grid and keep a one-line reason when it is empty. */
export async function loadShopCatalog(first = 48): Promise<ShopCatalog> {
  const issues = shopifyDomainIssues();
  if (issues.length > 0) {
    return { products: [], notice: publicNotice(issues) };
  }

  try {
    const products = await getProducts({ first, variantCount: 1 });
    if (products.length === 0) {
      return { products: [], notice: EMPTY_NOTICE };
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
