/**
 * Storefront API credentials. The Headless channel's *public* Storefront access
 * token is safe to ship to the browser, which is why all three are NEXT_PUBLIC_.
 * The Admin API is never used here — no private/admin token belongs in this app.
 *
 * Common mix-up: the Headless "public access token" is a 32-character hex string
 * and belongs in NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN. The store hostname
 * (`your-store.myshopify.com`) belongs in NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN.
 * `shpat_…` is an Admin API token and will be rejected.
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

const HOSTNAME = /^(?=.{1,253}$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;
const HEX32 = /^[a-f0-9]{32}$/i;
const ADMIN_TOKEN = /^(shpat_|shpca_|shpss_|shptk_)/i;

/** Why the current env cannot be used. Empty when both values look valid. */
export function shopifyConfigIssues(): string[] {
  const issues: string[] = [];

  if (!storeDomain) {
    issues.push("NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN is empty.");
  } else if (HEX32.test(storeDomain)) {
    issues.push(
      "NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN is a 32-character hex string — that is the Headless public access token. Put it in NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN and set the domain to your-store.myshopify.com.",
    );
  } else if (!HOSTNAME.test(storeDomain) || !storeDomain.includes(".")) {
    issues.push(
      "NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN must be a hostname such as your-store.myshopify.com (no https://).",
    );
  }

  if (!storefrontToken) {
    issues.push("NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN is empty.");
  } else if (ADMIN_TOKEN.test(storefrontToken)) {
    issues.push(
      "NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN looks like an Admin API token (shpat_/shpca_). Use the Headless channel's Storefront API public access token instead — usually a 32-character hex string, never shpat_.",
    );
  } else if (HOSTNAME.test(storefrontToken) || storefrontToken.includes("myshopify.com")) {
    issues.push(
      "NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN looks like a hostname. That value belongs in NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN.",
    );
  }

  return issues;
}

/** True when both the store domain and the Storefront token look usable. */
export function isShopifyConfigured(): boolean {
  return shopifyConfigIssues().length === 0;
}

/**
 * Resolve the config, throwing a message that names the missing or swapped variables.
 * Called per request rather than at import time so a site without a shop still builds.
 */
export function requireShopifyConfig(): ShopifyConfig {
  const issues = shopifyConfigIssues();
  if (issues.length > 0) {
    throw new Error(
      `[shopify] ${issues.join(" ")} Set in .env.local (see .env.example) — values come from Sales channels → Headless.`,
    );
  }

  return {
    storeDomain,
    storefrontToken,
    apiVersion,
    endpoint: `https://${storeDomain}/api/${apiVersion}/graphql.json`,
  };
}
