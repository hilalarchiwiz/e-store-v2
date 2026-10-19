import { cache } from "react";
import prisma from "@/lib/prisma";
import { getStorefrontProductFilter } from "@/lib/storefront-products";

// Metadata and page rendering share one lookup. Exact slugs take precedence
// over legacy IDs, including when a supplier uses a numeric slug.
export const getStorefrontProduct = cache(async (slug: string) => {
  const visibility = await getStorefrontProductFilter();
  const include = { brand: true, category: true, grading: true, reviews: true } as const;
  const product = await prisma.product.findFirst({
    where: { ...visibility, slug },
    include,
    orderBy: { id: "asc" },
  });
  if (product) return product;

  const id = Number(slug);
  if (/^\d+$/.test(slug) && Number.isSafeInteger(id) && id > 0 && id <= 2147483647) {
    return prisma.product.findFirst({ where: { ...visibility, id }, include });
  }

  // Product edits already record the old slug and immutable product ID in the
  // audit log. Recover old links without guessing a replacement from its title.
  const history = await prisma.auditLog.findFirst({
    where: {
      entityName: "Product",
      action: "UPDATE",
      oldData: { path: ["slug"], equals: slug },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: { entityId: true },
  });
  const previousId = Number(history?.entityId);
  if (!Number.isSafeInteger(previousId) || previousId <= 0 || previousId > 2147483647) return null;
  return prisma.product.findFirst({ where: { ...visibility, id: previousId }, include });
});
