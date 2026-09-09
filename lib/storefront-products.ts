import prisma from "@/lib/prisma";
import { PRODUCT_VISIBILITY_KEY, parseShowOutOfStock, productVisibilityFilter } from "@/lib/product-visibility";

export async function getStorefrontProductFilter() {
  const setting = await prisma.setting.findUnique({ where: { key: PRODUCT_VISIBILITY_KEY } });
  return productVisibilityFilter(parseShowOutOfStock(setting?.value));
}
