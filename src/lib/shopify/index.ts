/**
 * Shopify Storefront API client.
 *
 * Usage (server component or route handler):
 *
 *   import { getProducts, getProductByHandle } from "@/lib/shopify";
 *
 *   const products = await getProducts({ first: 12 });
 *   const tee = await getProductByHandle("no-school-tee");
 *
 * Credentials come from SHOPIFY_* / NEXT_PUBLIC_SHOPIFY_* (see .env.example).
 * A store domain is enough for tokenless product reads when the Online Store
 * is public. The live No School hostname is used when SHOPIFY_STORE_DOMAIN
 * is unset.
 */

export {
  isShopifyConfigured,
  requireShopifyConfig,
  shopifyConfigIssues,
  shopifyDomainIssues,
  hasShopifyToken,
  readShopifyEnv,
  DEFAULT_API_VERSION,
  DEFAULT_STORE_DOMAIN,
  type ShopifyConfig,
  type ShopifyEnv,
} from "./env";

export {
  ShopifyStorefrontError,
  storefrontFetch,
  STOREFRONT_REVALIDATE_SECONDS,
  type StorefrontFetchOptions,
} from "./client";

export { shopifyFetchOrDefault, loadShopCatalog, type ShopCatalog } from "./fetch-safe";

export { formatMoney, formatPriceRange } from "./money";

export {
  getShop,
  getProducts,
  getProductByHandle,
  type GetProductsOptions,
  type GetProductOptions,
} from "./storefront";

export type {
  ShopifyImage,
  ShopifyMoney,
  ShopifyPriceRange,
  ShopifyProduct,
  ShopifyShop,
  ShopifyVariant,
} from "./types";
