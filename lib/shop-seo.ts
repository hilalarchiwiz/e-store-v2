import type { ShopFilters } from "@/lib/shop-products";

export type IndexableShopFilter = {
  type: "category" | "brand";
  value: string;
};

/** Only single category and single brand views are useful search landing pages. */
export function getIndexableShopFilter(
  params: ShopFilters,
): IndexableShopFilter | null {
  const active = Object.entries(params).filter(([, value]) => value?.trim());
  if (active.length !== 1) return null;

  const [type, rawValue] = active[0];
  if ((type !== "category" && type !== "brand") || !rawValue) return null;

  const value = rawValue.trim();
  if (!value || value.includes(",")) return null;

  return { type, value };
}
