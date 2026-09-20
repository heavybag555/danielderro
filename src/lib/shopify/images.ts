import type { ShopifyImage, ShopifyProduct } from "./types";

/** Second gallery still, used to swap the shop tile on hover. */
export function secondProductImage(product: ShopifyProduct): ShopifyImage | null {
  const primaryUrl = product.featuredImage?.url;
  return product.images.find((image) => image.url !== primaryUrl) ?? null;
}
