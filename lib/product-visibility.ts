export const PRODUCT_VISIBILITY_KEY = "product_visibility";

export function parseShowOutOfStock(value: string | null | undefined): boolean {
  if (!value) return true;
  try {
    return JSON.parse(value)?.showOutOfStock !== false;
  } catch {
    return true;
  }
}

export function productVisibilityFilter(showOutOfStock: boolean) {
  return { status: "active" as const, ...(!showOutOfStock ? { quantity: { gt: 0 } } : {}) };
}
