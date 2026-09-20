import { NextResponse } from "next/server";
import {
  getProducts,
  getShop,
  isShopifyConfigured,
  shopifyApiVersion,
  ShopifyStorefrontError,
} from "@/lib/shopify";

/**
 * Smoke test for the Storefront credentials: GET /api/shopify/health returns the
 * shop name and how many products the token can see. Never echoes the token.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isShopifyConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        error:
          "Set NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN in .env.local.",
      },
      { status: 503 },
    );
  }

  try {
    const [shop, products] = await Promise.all([
      getShop({ revalidate: false }),
      getProducts({ first: 250, variantCount: 1, revalidate: false }),
    ]);

    return NextResponse.json({
      ok: true,
      configured: true,
      apiVersion: shopifyApiVersion,
      shop: shop.name,
      productCount: products.length,
    });
  } catch (err) {
    console.error("[shopify] health check failed:", err);
    const message =
      err instanceof ShopifyStorefrontError
        ? err.message
        : "Unexpected Storefront failure";
    return NextResponse.json(
      { ok: false, configured: true, error: message },
      { status: 502 },
    );
  }
}
