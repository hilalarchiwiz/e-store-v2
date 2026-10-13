import type { ShopFilters } from "@/lib/shop-products";

export type IndexableShopFilter = {
  type: "category" | "brand";
  value: string;
};

function hasValidPage(params: ShopFilters) {
  if (!params.page) return true;
  const page = Number(params.page);
  return Number.isSafeInteger(page) && page > 0;
}

/**
 * Pagination is part of a crawlable product listing. Search, sorting, price,
 * generation, and compound filters are utility views and should stay out of
 * the index.
 */
export function isIndexableShopListing(params: ShopFilters) {
  if (!hasValidPage(params)) return false;

  const nonPaginationParams = Object.entries(params).filter(
    ([key, value]) => key !== "page" && value?.trim(),
  );

  if (nonPaginationParams.length === 0) return true;
  if (nonPaginationParams.length !== 1) return false;

  const [type, rawValue] = nonPaginationParams[0];
  return (
    (type === "category" || type === "brand") &&
    Boolean(rawValue?.trim()) &&
    !rawValue?.includes(",")
  );
}

/** Only single category and single brand views are useful search landing pages. */
export function getIndexableShopFilter(
  params: ShopFilters,
): IndexableShopFilter | null {
  if (!hasValidPage(params)) return null;

  const active = Object.entries(params).filter(
    ([key, value]) => key !== "page" && value?.trim(),
  );
  if (active.length !== 1) return null;

  const [type, rawValue] = active[0];
  if ((type !== "category" && type !== "brand") || !rawValue) return null;

  const value = rawValue.trim();
  if (!value || value.includes(",")) return null;

  return { type, value };
}
