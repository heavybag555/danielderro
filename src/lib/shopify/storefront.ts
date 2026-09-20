import { ShopifyStorefrontError, storefrontFetch } from "./client";
import { hasShopifyToken } from "./env";
import {
  collectionProductsQuery,
  productByHandleQuery,
  productsQuery,
  shopQuery,
} from "./queries";
import type {
  ShopifyProduct,
  ShopifyShop,
  StorefrontCollectionsQuery,
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
  const { variants, images, featuredImage, ...product } = node;
  return {
    ...product,
    featuredImage: featuredImage ?? images?.nodes?.[0] ?? null,
    variants: variants?.nodes ?? [],
  };
}

function uniqueProducts(products: ShopifyProduct[]): ShopifyProduct[] {
  const seen = new Set<string>();
  return products.filter((product) => {
    if (seen.has(product.id)) return false;
    seen.add(product.id);
    return true;
  });
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

  const products = (data.products.nodes ?? []).map(normalizeProduct);
  if (products.length > 0) return products;

  // Collection fan-out is too expensive for tokenless (complexity cap 1000)
  // and is only useful when a Headless token can see unpublished-to-OS goods.
  if (!hasShopifyToken()) return products;

  try {
    const collections = await storefrontFetch<StorefrontCollectionsQuery>({
      query: collectionProductsQuery,
      variables: {
        first: clampPageSize(first, DEFAULT_PAGE_SIZE),
        variantCount: clampPageSize(variantCount, DEFAULT_VARIANT_COUNT),
      },
      ...options,
    });
    return uniqueProducts(
      (collections.collections.nodes ?? []).flatMap((collection) =>
        (collection.products.nodes ?? []).map(normalizeProduct),
      ),
    );
  } catch (err) {
    if (err instanceof ShopifyStorefrontError) return products;
    throw err;
  }
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
