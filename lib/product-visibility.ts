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

export function bulkOutOfStockVisibilityUpdate(productIds: number[], visible: boolean) {
  if (!Array.isArray(productIds) || productIds.length === 0 || productIds.length > 100
    || productIds.some(id => !Number.isSafeInteger(id) || id <= 0)
    || typeof visible !== "boolean") {
    throw new Error("Select between 1 and 100 valid products.");
  }
  return {
    where: {
      id: { in: [...new Set(productIds)] },
      quantity: { lte: 0 },
      status: visible ? "inactive" as const : "active" as const,
    },
    data: { status: visible ? "active" as const : "inactive" as const },
  };
}
