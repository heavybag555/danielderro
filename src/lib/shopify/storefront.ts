import { storefrontFetch } from "./client";
import {
  productByHandleQuery,
  productsQuery,
  shopQuery,
} from "./queries";
import type {
  ShopifyProduct,
  ShopifyShop,
  StorefrontProductByHandleQuery,
  StorefrontProductNode,
  StorefrontProductsQuery,
  StorefrontShopQuery,
} from "./types";

/** Storefront caps `first` at 250 per connection. */
const MAX_PAGE_SIZE = 250;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_VARIANT_COUNT = 100;

type ReadOptions = {
  /** Seconds to cache the response; `false` opts out of the Next data cache. */
  revalidate?: number | false;
  tags?: string[];
  signal?: AbortSignal;
};

export type GetProductsOptions = ReadOptions & {
  first?: number;
  /** Variants requested per product. */
  variantCount?: number;
};

export type GetProductOptions = ReadOptions & {
  variantCount?: number;
};

function clampPageSize(first: number | undefined, fallback: number): number {
  if (!Number.isFinite(first)) return fallback;
  return Math.min(Math.max(Math.trunc(first as number), 1), MAX_PAGE_SIZE);
}

function normalizeProduct(node: StorefrontProductNode): ShopifyProduct {
  const { variants, ...product } = node;
  return { ...product, variants: variants?.nodes ?? [] };
}

/** Shop name, description, and primary domain — the cheapest way to verify credentials. */
export async function getShop(options: ReadOptions = {}): Promise<ShopifyShop> {
  const data = await storefrontFetch<StorefrontShopQuery>({
    query: shopQuery,
    ...options,
  });

  return {
    name: data.shop.name,
    description: data.shop.description,
    primaryDomainUrl: data.shop.primaryDomain.url,
  };
}

/** Most recently updated products first. */
export async function getProducts({
  first,
  variantCount,
  ...options
}: GetProductsOptions = {}): Promise<ShopifyProduct[]> {
  const data = await storefrontFetch<StorefrontProductsQuery>({
    query: productsQuery,
    variables: {
      first: clampPageSize(first, DEFAULT_PAGE_SIZE),
      variantCount: clampPageSize(variantCount, DEFAULT_VARIANT_COUNT),
    },
    ...options,
  });

  return (data.products.nodes ?? []).map(normalizeProduct);
}

/** A single product by its Shopify handle (the URL slug), or `null` when unpublished/missing. */
export async function getProductByHandle(
  handle: string,
  { variantCount, ...options }: GetProductOptions = {},
): Promise<ShopifyProduct | null> {
  const trimmed = handle.trim();
  if (!trimmed) return null;

  const data = await storefrontFetch<StorefrontProductByHandleQuery>({
    query: productByHandleQuery,
    variables: {
      handle: trimmed,
      variantCount: clampPageSize(variantCount, DEFAULT_VARIANT_COUNT),
    },
    ...options,
  });

  return data.product ? normalizeProduct(data.product) : null;
}
