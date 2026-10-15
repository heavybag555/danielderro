/** Normalized Storefront shapes: connections are flattened to arrays at the fetch boundary. */

export type ShopifyMoney = {
  /** Decimal string, e.g. "120.00" — kept as a string to avoid float rounding. */
  amount: string;
  currencyCode: string;
};

export type ShopifyImage = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

export type ShopifyVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: ShopifyMoney;
};

export type ShopifyPriceRange = {
  minVariantPrice: ShopifyMoney;
  maxVariantPrice: ShopifyMoney;
};

export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  availableForSale: boolean;
  featuredImage: ShopifyImage | null;
  images: ShopifyImage[];
  priceRange: ShopifyPriceRange;
  variants: ShopifyVariant[];
};

export type ShopifyShop = {
  name: string;
  description: string | null;
  primaryDomainUrl: string;
};

/** Raw GraphQL edges/nodes shapes, before `normalizeProduct` flattens them. */
export type StorefrontConnection<T> = {
  nodes: T[];
};

export type StorefrontProductNode = Omit<ShopifyProduct, "variants" | "images"> & {
  variants: StorefrontConnection<ShopifyVariant>;
  images?: StorefrontConnection<ShopifyImage> | null;
};

export type StorefrontCollectionsQuery = {
  collections: StorefrontConnection<{
    products: StorefrontConnection<StorefrontProductNode>;
  }>;
};

export type StorefrontShopQuery = {
  shop: {
    name: string;
    description: string | null;
    primaryDomain: { url: string };
  };
};

export type StorefrontProductsQuery = {
  products: StorefrontConnection<StorefrontProductNode>;
};

export type StorefrontProductByHandleQuery = {
  product: StorefrontProductNode | null;
};
