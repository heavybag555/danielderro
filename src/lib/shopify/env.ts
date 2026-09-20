/**
 * Storefront API credentials. The Headless channel's *public* Storefront access
 * token is safe to ship to the browser, which is why all three are NEXT_PUBLIC_.
 * The Admin API is never used here — no private/admin token belongs in this app.
 */

/** Strip protocol and trailing slash so `https://shop.myshopify.com/` still works. */
function normalizeDomain(value: string | undefined): string {
  return (value ?? "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");
}

export const storeDomain = normalizeDomain(
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
);

export const storefrontToken =
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN?.trim() ?? "";

export const apiVersion =
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION?.trim() || "2025-01";

export type ShopifyConfig = {
  storeDomain: string;
  storefrontToken: string;
  apiVersion: string;
  endpoint: string;
};

/** True when both the store domain and the Storefront token are present. */
export function isShopifyConfigured(): boolean {
  return Boolean(storeDomain && storefrontToken);
}

/**
 * Resolve the config, throwing a message that names the missing variables.
 * Called per request rather than at import time so a site without a shop still builds.
 */
export function requireShopifyConfig(): ShopifyConfig {
  const missing: string[] = [];
  if (!storeDomain) missing.push("NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN");
  if (!storefrontToken) missing.push("NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN");

  if (missing.length > 0) {
    throw new Error(
      `[shopify] Missing environment variable${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}. ` +
        "Set in .env.local (see .env.example) — values come from the Shopify Headless channel.",
    );
  }

  return {
    storeDomain,
    storefrontToken,
    apiVersion,
    endpoint: `https://${storeDomain}/api/${apiVersion}/graphql.json`,
  };
}
