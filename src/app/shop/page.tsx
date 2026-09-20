import ShopIndex from "@/components/ShopIndex";
import { loadShopCatalog } from "@/lib/shopify";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const { products, notice } = await loadShopCatalog(48);

  return <ShopIndex products={products} notice={notice} />;
}
