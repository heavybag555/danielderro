import ShopIndex from "@/components/ShopIndex";
import { getProducts, shopifyFetchOrDefault } from "@/lib/shopify";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await shopifyFetchOrDefault(
    () => getProducts({ first: 48 }),
    [],
  );

  return <ShopIndex products={products} />;
}
