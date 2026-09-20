import { NextResponse } from "next/server";
import {
  getProducts,
  getShop,
  hasShopifyToken,
  isShopifyConfigured,
  readShopifyEnv,
  shopifyConfigIssues,
  shopifyDomainIssues,
  ShopifyStorefrontError,
} from "@/lib/shopify";

/**
 * Smoke test for the Storefront credentials: GET /api/shopify/health returns the
 * shop name and how many products this storefront can see. Never echoes the token.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isShopifyConfigured()) {
    const issues = shopifyDomainIssues();
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        error: issues[0] ?? "Set SHOPIFY_STORE_DOMAIN in .env.local.",
        issues,
      },
      { status: 503 },
    );
  }

  const tokenless = !hasShopifyToken();

  try {
    const [shop, products] = await Promise.all([
      getShop({ revalidate: false }),
      getProducts({ first: 48, variantCount: 1, revalidate: false }),
    ]);

    return NextResponse.json({
      ok: true,
      configured: true,
      tokenless,
      apiVersion: readShopifyEnv().apiVersion,
      shop: shop.name,
      productCount: products.length,
      ...(products.length === 0
        ? {
            hint: "The storefront answered, but no products are published to it. Publish them to the Online Store or the Headless sales channel.",
          }
        : {}),
      ...(shopifyConfigIssues().length > 0 ? { issues: shopifyConfigIssues() } : {}),
    });
  } catch (err) {
    console.error("[shopify] health check failed:", err);
    const storefrontError = err instanceof ShopifyStorefrontError ? err : null;
    const message = storefrontError?.message ?? "Unexpected Storefront failure";
    const locked = storefrontError?.code === "locked";
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        tokenless,
        error: message,
        ...(locked
          ? {
              hint: "The Online Store is password-locked. Remove that password, or add the Headless Storefront public access token and publish products to Headless.",
            }
          : {}),
      },
      { status: 502 },
    );
  }
}
