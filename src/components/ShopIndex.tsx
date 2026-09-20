"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import SitePageFooter from "@/components/SitePageFooter";
import { mediaEnterTransition } from "@/lib/motion";
import { formatPriceRange } from "@/lib/shopify/money";
import { secondProductImage } from "@/lib/shopify/images";
import type { ShopifyProduct } from "@/lib/shopify";
import { useDismissOnScroll } from "@/lib/use-dismiss-on-scroll";
import { useMediaQuery } from "@/lib/use-media-query";

const HOVER_HOLD_MS = 450;
const SHOP_HEADING = "Shop";

export default function ShopIndex({
  products,
  notice,
}: {
  products: ShopifyProduct[];
  notice?: string | null;
}) {
  const reduceMotion = useReducedMotion();
  const isCoarse = useMediaQuery("(hover: none), (pointer: coarse)");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hoverTimer = useRef<number | null>(null);
  const hoveredTitle =
    products.find((product) => product.id === hoveredId)?.title ?? null;
  const [lastHoveredTitle, setLastHoveredTitle] = useState("");

  const clearHoverTimer = () => {
    if (hoverTimer.current !== null) {
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  const requestHover = (id: string | null) => {
    clearHoverTimer();
    if (isCoarse || id === null) {
      setHoveredId(null);
      return;
    }
    hoverTimer.current = window.setTimeout(() => {
      setHoveredId(id);
      hoverTimer.current = null;
    }, HOVER_HOLD_MS);
  };

  useDismissOnScroll(() => {
    clearHoverTimer();
    setHoveredId(null);
  });

  useEffect(() => {
    if (hoveredTitle) setLastHoveredTitle(hoveredTitle);
  }, [hoveredTitle]);

  useEffect(() => clearHoverTimer, []);

  return (
    <div className="shop-page-shell">
      <header className="work-page-header layout-full">
        <div className="work-header-bar layout-grid">
          <div className="work-heading">
            <h1 className="text-heading work-heading-line" data-on={!hoveredTitle}>
              {SHOP_HEADING}
            </h1>
            <span
              aria-hidden="true"
              className="text-heading work-heading-line"
              data-on={Boolean(hoveredTitle)}
            >
              {lastHoveredTitle}
            </span>
          </div>
        </div>
      </header>

      <div className="layout-full work-page-content site-page-bottom-padding">
        {products.length === 0 ? (
          <p className="shop-empty content-compact text-caption">
            {notice ?? "No products yet."}
          </p>
        ) : (
          <ul className="shop-grid layout-grid">
            {products.map((product, index) => {
              const soldOut = !product.availableForSale;
              const dimmed = !soldOut && hoveredId !== null && hoveredId !== product.id;
              const image = product.featuredImage;
              const hoverImage = soldOut ? null : secondProductImage(product);
              const tileClass = `shop-tile-link${soldOut ? " is-sold-out" : " hover-smooth"}${
                dimmed ? " is-dimmed" : ""
              }`;
              const tile = (
                <>
                  <div className="shop-tile-media relative">
                    {image ? (
                      <Image
                        src={image.url}
                        alt={image.altText || product.title}
                        fill
                        priority={index === 0}
                        quality={90}
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                        className="shop-tile-image object-cover"
                      />
                    ) : null}
                    {hoverImage ? (
                      <Image
                        src={hoverImage.url}
                        alt=""
                        fill
                        quality={90}
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                        className="shop-tile-image shop-tile-image-hover object-cover transition-opacity duration-[600ms] ease-[cubic-bezier(0.76,0,0.24,1)] motion-reduce:duration-0"
                      />
                    ) : null}
                  </div>
                  <div className="shop-tile-caption">
                    <span className="shop-tile-title text-small">{product.title}</span>
                    <span className="shop-tile-price text-caption">
                      {soldOut ? "Sold out" : formatPriceRange(product.priceRange)}
                    </span>
                  </div>
                </>
              );

              return (
                <li key={product.id} className="shop-tile">
                  <motion.div
                    initial={reduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={reduceMotion ? { duration: 0 } : mediaEnterTransition(index)}
                  >
                    {soldOut ? (
                      <div className={tileClass}>{tile}</div>
                    ) : (
                      <Link
                        href={`/shop/${product.handle}`}
                        className={tileClass}
                        onMouseEnter={() => requestHover(product.id)}
                        onMouseLeave={() => requestHover(null)}
                        onFocus={() => requestHover(product.id)}
                        onBlur={() => requestHover(null)}
                      >
                        {tile}
                      </Link>
                    )}
                  </motion.div>
                </li>
              );
            })}
          </ul>
        )}

        <SitePageFooter />
      </div>
    </div>
  );
}
