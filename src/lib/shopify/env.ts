/**
 * Storefront API credentials. Read at request time through `process.env[name]`
 * so Next cannot inline an empty NEXT_PUBLIC_ value at compile time — that was
 * leaving /shop blank after keys were added.
 *
 * Preferred server-only names (not baked into the client bundle):
 *   SHOPIFY_STORE_DOMAIN
 *   SHOPIFY_STOREFRONT_API_TOKEN
 *   SHOPIFY_STOREFRONT_PRIVATE_TOKEN   (Headless private token, optional)
 *
 * NEXT_PUBLIC_SHOPIFY_* and Hydrogen PUBLIC_* / PRIVATE_* aliases are accepted.
 * The Admin API is never used — shpat_ / shpca_ values are ignored.
 *
 * A public or private Storefront token is optional. Shopify allows tokenless
 * reads of products when the Online Store is public. Password-locked shops
 * still need the Headless public token (and products published to Headless).
 */

/** Strip protocol and trailing slash so `https://shop.myshopify.com/` still works. */
function normalizeDomain(value: string | undefined): string {
  return (value ?? "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");
}

/** Dynamic key so Next.js does not replace the access with a build-time literal. */
function readEnv(name: string): string {
  return (process.env[name] ?? "").trim();
}

function firstEnv(keys: readonly string[]): { key: string; value: string } {
  for (const key of keys) {
    const value = readEnv(key);
    if (value) return { key, value };
  }
  return { key: keys[0], value: "" };
}

const DOMAIN_KEYS = [
  "SHOPIFY_STORE_DOMAIN",
  "NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN",
  "PUBLIC_STORE_DOMAIN",
] as const;

const PUBLIC_TOKEN_KEYS = [
  "SHOPIFY_STOREFRONT_API_TOKEN",
  "NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN",
  "PUBLIC_STOREFRONT_API_TOKEN",
] as const;

const PRIVATE_TOKEN_KEYS = [
  "SHOPIFY_STOREFRONT_PRIVATE_TOKEN",
  "PRIVATE_STOREFRONT_API_TOKEN",
] as const;

const VERSION_KEYS = [
  "SHOPIFY_STOREFRONT_API_VERSION",
  "NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION",
  "PUBLIC_STOREFRONT_API_VERSION",
] as const;

export const DEFAULT_API_VERSION = "2025-01";

export type ShopifyEnv = {
  storeDomain: string;
  storefrontToken: string;
  privateToken: string;
  apiVersion: string;
  domainKey: string;
  tokenKey: string;
  privateTokenKey: string;
};

/** Current Storefront credentials. Call per request — do not cache at module scope. */
export function readShopifyEnv(): ShopifyEnv {
  const domain = firstEnv(DOMAIN_KEYS);
  const token = firstEnv(PUBLIC_TOKEN_KEYS);
  const privateToken = firstEnv(PRIVATE_TOKEN_KEYS);
  const version = firstEnv(VERSION_KEYS);

  return {
    storeDomain: normalizeDomain(domain.value),
    storefrontToken: token.value,
    privateToken: privateToken.value,
    apiVersion: version.value || DEFAULT_API_VERSION,
    domainKey: domain.key,
    tokenKey: token.key,
    privateTokenKey: privateToken.key,
  };
}

export type ShopifyConfig = {
  storeDomain: string;
  storefrontToken: string;
  privateToken: string;
  apiVersion: string;
  endpoint: string;
};

const HOSTNAME =
  /^(?=.{1,253}$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;
const HEX32 = /^[a-f0-9]{32}$/i;
const ADMIN_TOKEN = /^(shpat_|shpca_|shpss_|shptk_)/i;

function tokenIssues(value: string, key: string): string[] {
  if (!value) return [];
  if (ADMIN_TOKEN.test(value)) {
    return [
      `${key} looks like an Admin API token (shpat_/shpca_). Use the Headless channel's Storefront API public access token instead — usually a 32-character hex string, never shpat_.`,
    ];
  }
  if (HOSTNAME.test(value) || value.includes("myshopify.com")) {
    return [`${key} looks like a hostname. That value belongs in SHOPIFY_STORE_DOMAIN.`];
  }
  return [];
}

function usableToken(value: string, key: string): string {
  return tokenIssues(value, key).length > 0 ? "" : value;
}

/** Why the store domain cannot be used. Empty when the hostname looks valid. */
export function shopifyDomainIssues(): string[] {
  const env = readShopifyEnv();
  const issues: string[] = [];

  if (!env.storeDomain) {
    issues.push("SHOPIFY_STORE_DOMAIN is empty.");
  } else if (HEX32.test(env.storeDomain)) {
    issues.push(
      "SHOPIFY_STORE_DOMAIN is a 32-character hex string — that is the Headless public access token. Put it in SHOPIFY_STOREFRONT_API_TOKEN and set the domain to your-store.myshopify.com.",
    );
  } else if (!HOSTNAME.test(env.storeDomain) || !env.storeDomain.includes(".")) {
    issues.push(
      "SHOPIFY_STORE_DOMAIN must be a hostname such as your-store.myshopify.com (no https://).",
    );
  }

  return issues;
}

/** Domain problems plus unused/swapped token warnings. Tokenless shops can still query. */
export function shopifyConfigIssues(): string[] {
  const env = readShopifyEnv();
  return [
    ...shopifyDomainIssues(),
    ...tokenIssues(env.storefrontToken, env.tokenKey),
    ...tokenIssues(env.privateToken, env.privateTokenKey),
  ];
}

/** True when the store hostname looks usable. A Storefront token is optional. */
export function isShopifyConfigured(): boolean {
  return shopifyDomainIssues().length === 0;
}

/** True when a non-Admin Storefront public or private token is present. */
export function hasShopifyToken(): boolean {
  const env = readShopifyEnv();
  return Boolean(
    usableToken(env.storefrontToken, env.tokenKey) ||
      usableToken(env.privateToken, env.privateTokenKey),
  );
}

/**
 * Resolve the config, throwing a message that names the missing or swapped domain.
 * Admin / swapped tokens are dropped so the request can fall back to tokenless.
 * Called per request rather than at import time so a site without a shop still builds.
 */
export function requireShopifyConfig(): ShopifyConfig {
  const issues = shopifyDomainIssues();
  if (issues.length > 0) {
    throw new Error(
      `[shopify] ${issues.join(" ")} Set SHOPIFY_STORE_DOMAIN in .env.local or Vercel (see .env.example).`,
    );
  }

  const env = readShopifyEnv();
  return {
    storeDomain: env.storeDomain,
    storefrontToken: usableToken(env.storefrontToken, env.tokenKey),
    privateToken: usableToken(env.privateToken, env.privateTokenKey),
    apiVersion: env.apiVersion,
    endpoint: `https://${env.storeDomain}/api/${env.apiVersion}/graphql.json`,
  };
}
