import type { ShopifyMoney, ShopifyPriceRange } from "./types";

/** Format a Storefront money value without float-rounding the source string. */
export function formatMoney(money: ShopifyMoney): string {
  const amount = Number(money.amount);
  const value = Number.isFinite(amount)
    ? amount.toLocaleString("en-US", {
        minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      })
    : money.amount;

  if (money.currencyCode === "USD") return `$${value}`;
  return `${value} ${money.currencyCode}`;
}

/** Single price, or a "from" when variants span a range. */
export function formatPriceRange(range: ShopifyPriceRange): string {
  const min = formatMoney(range.minVariantPrice);
  const max = formatMoney(range.maxVariantPrice);
  if (min === max) return min;
  return `From ${min}`;
}
