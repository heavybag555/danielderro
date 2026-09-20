import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SitePageFooter from "@/components/SitePageFooter";
import {
  formatMoney,
  formatPriceRange,
  getProductByHandle,
  shopifyFetchOrDefault,
} from "@/lib/shopify";

export const dynamic = "force-dynamic";

type ShopProductPageProps = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({
  params,
}: ShopProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await shopifyFetchOrDefault(
    () => getProductByHandle(handle),
    null,
  );

  if (!product) {
    return { title: "Shop" };
  }

  return {
    title: product.title,
    description: product.description || undefined,
    alternates: { canonical: `/shop/${product.handle}` },
    openGraph: {
      title: product.title,
      description: product.description || undefined,
      url: `/shop/${product.handle}`,
    },
  };
}

export default async function ShopProductPage({ params }: ShopProductPageProps) {
  const { handle } = await params;
  const product = await shopifyFetchOrDefault(
    () => getProductByHandle(handle),
    null,
  );

  if (!product) notFound();

  const image = product.featuredImage;
  const width = image?.width || 1600;
  const height = image?.height || 1600;
  const variants = product.variants.filter((variant) => variant.title !== "Default Title");

  return (
    <div className="shop-page-shell">
      <article className="shop-product layout-grid">
        <div className="shop-product-media">
          {image ? (
            <Image
              src={image.url}
              alt={image.altText || product.title}
              width={width}
              height={height}
              quality={90}
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="shop-tile-image"
            />
          ) : null}
        </div>

        <div className="shop-product-copy">
          <p className="text-caption shop-product-back">
            <Link href="/shop" className="hover-smooth">
              Shop
            </Link>
          </p>
          <h1 className="text-small">{product.title}</h1>
          <p className="text-caption shop-tile-price">
            {product.availableForSale
              ? formatPriceRange(product.priceRange)
              : "Sold out"}
          </p>
          {product.description ? (
            <p className="text-small shop-product-description">{product.description}</p>
          ) : null}
          {variants.length > 0 ? (
            <ul className="shop-product-variants">
              {variants.map((variant) => (
                <li key={variant.id} className="text-caption">
                  {variant.title}
                  <span className="shop-tile-price">
                    {variant.availableForSale
                      ? formatMoney(variant.price)
                      : "Sold out"}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </article>

      <SitePageFooter />
    </div>
  );
}
