"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import SitePageFooter from "@/components/SitePageFooter";
import { mediaEnterTransition } from "@/lib/motion";
import { formatPriceRange } from "@/lib/shopify/money";
import type { ShopifyProduct } from "@/lib/shopify";
import { useDismissOnScroll } from "@/lib/use-dismiss-on-scroll";
import { useMediaQuery } from "@/lib/use-media-query";

const HOVER_HOLD_MS = 450;

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

  useEffect(() => clearHoverTimer, []);

  return (
    <div className="shop-page-shell layout-full">
      <h1 className="visually-hidden">Shop</h1>

      {products.length === 0 ? (
        <p className="shop-empty content-compact text-caption">
          {notice ?? "No products yet."}
        </p>
      ) : (
        <ul className="shop-grid layout-grid">
          {products.map((product, index) => {
            const dimmed = hoveredId !== null && hoveredId !== product.id;
            const image = product.featuredImage;

            return (
              <li key={product.id} className="shop-tile">
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={reduceMotion ? { duration: 0 } : mediaEnterTransition(index)}
                >
                  <Link
                    href={`/shop/${product.handle}`}
                    className={`shop-tile-link hover-smooth${dimmed ? " is-dimmed" : ""}`}
                    onMouseEnter={() => requestHover(product.id)}
                    onMouseLeave={() => requestHover(null)}
                    onFocus={() => requestHover(product.id)}
                    onBlur={() => requestHover(null)}
                  >
                    <div className="shop-tile-media relative">
                      {image ? (
                        <Image
                          src={image.url}
                          alt={image.altText || product.title}
                          fill
                          quality={90}
                          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                          className="shop-tile-image object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="shop-tile-caption">
                      <span className="shop-tile-title text-small">{product.title}</span>
                      <span className="shop-tile-price text-caption">
                        {product.availableForSale
                          ? formatPriceRange(product.priceRange)
                          : "Sold out"}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              </li>
            );
          })}
        </ul>
      )}

      <SitePageFooter />
    </div>
  );
}
