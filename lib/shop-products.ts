import { getStorefrontProductFilter } from "@/lib/storefront-products";
import prisma from "@/lib/prisma";

export interface ShopFilters {
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  search?: string;
  generation?: string;
}

function getLaptopGeneration(title: string): number {
  const patterns = [
    /\b(\d{1,2})(?:st|nd|rd|th)?\s*(?:gen|generation)\b/i,
    /\b(?:gen|generation)\s*[:#-]?\s*(\d{1,2})\b/i,
    /\b(?:core\s*)?i[3579]\b[^0-9]{0,12}\b(\d{1,2})(?:st|nd|rd|th)\b/i,
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    const generation = match ? Number(match[1]) : 0;
    if (generation >= 1 && generation <= 20) return generation;
  }

  return 0;
}

export async function getShopProducts(resolvedSearchParams: ShopFilters, skip = 0, limit = 20) {
  const categoryParam = resolvedSearchParams.category;
  let categoryIds: number[] = [];
  if (categoryParam) {
    const parts = categoryParam.split(",");
    const numeric = parts.map(Number).filter((n) => !isNaN(n));
    const strings = parts.filter((p) => isNaN(Number(p)));
    categoryIds = [...numeric];
    if (strings.length > 0) {
      const found = await prisma.category.findMany({
        where: {
          OR: strings.map(s => ({
            OR: [
              { slug: { equals: s, mode: 'insensitive' as const } },
              { title: { equals: s, mode: 'insensitive' as const } },
            ]
          }))
        },
        select: { id: true }
      });
      categoryIds.push(...found.map(f => f.id));
    }
  }

  const brandParam = resolvedSearchParams.brand;
  let brandIds: number[] = [];
  if (brandParam) {
    const parts = brandParam.split(",");
    const numeric = parts.map(Number).filter((n) => !isNaN(n));
    const strings = parts.filter((p) => isNaN(Number(p)));
    brandIds = [...numeric];
    if (strings.length > 0) {
      const found = await prisma.brand.findMany({
        where: { OR: strings.map(s => ({ title: { equals: s, mode: 'insensitive' } })) },
        select: { id: true }
      });
      brandIds.push(...found.map(f => f.id));
    }
  }

  const sort = resolvedSearchParams.sort || "newest";
  const search = resolvedSearchParams.search?.trim() || "";

  const visibility = await getStorefrontProductFilter();
  const where: any = { ...visibility };

  // Only apply price filter when explicitly set in URL
  if (resolvedSearchParams.minPrice || resolvedSearchParams.maxPrice) {
    where.price = {
      gte: Number(resolvedSearchParams.minPrice) || 0,
      lte: Number(resolvedSearchParams.maxPrice) || 999999999,
    };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (categoryIds.length > 0) where.categoryId = { in: categoryIds };
  if (brandIds.length > 0) where.brandId = { in: brandIds };

  const selectedCategory =
    categoryIds.length === 1
      ? await prisma.category.findUnique({
        where: { id: categoryIds[0] },
        select: { title: true },
      })
      : null;
  const selectedCategoryName = selectedCategory?.title.trim().toLowerCase();
  const isLaptopCategory =
    selectedCategoryName === "laptop" || selectedCategoryName === "laptops";

  const laptopGenerationCandidates = isLaptopCategory
    ? await prisma.product.findMany({
      where: { categoryId: categoryIds[0], ...visibility },
      select: { id: true, title: true },
    })
    : [];
  const laptopGenerations = Array.from(
    new Set(
      laptopGenerationCandidates
        .map((product) => getLaptopGeneration(product.title))
        .filter((generation) => generation > 0),
    ),
  ).sort((a, b) => b - a);
  const selectedGenerations = Array.from(
    new Set(
      (resolvedSearchParams.generation || "")
        .split(",")
        .map(Number)
        .filter((generation) => laptopGenerations.includes(generation)),
    ),
  );

  if (isLaptopCategory && selectedGenerations.length > 0) {
    where.id = {
      in: laptopGenerationCandidates
        .filter((product) =>
          selectedGenerations.includes(getLaptopGeneration(product.title)),
        )
        .map((product) => product.id),
    };
  }

  const shouldSortByLaptopGeneration =
    isLaptopCategory && sort === "newest";

  let orderBy: any = { createdAt: "desc" };
  if (sort === "price_asc") orderBy = { price: "asc" };
  if (sort === "price_desc") orderBy = { price: "desc" };
  if (sort === "oldest") orderBy = { createdAt: "asc" };

  const loadProducts = async () => {
    const include = { category: true, reviews: true } as const;

    if (!shouldSortByLaptopGeneration) {
      return prisma.product.findMany({
        where,
        include,
        take: limit,
        skip,
        orderBy: [orderBy, { id: "desc" }],
      });
    }

    const laptopCandidates = await prisma.product.findMany({
      where,
      select: { id: true, title: true, createdAt: true },
    });

    const pageProductIds = laptopCandidates
      .sort((a, b) => {
        const generationDifference =
          getLaptopGeneration(b.title) - getLaptopGeneration(a.title);

        if (generationDifference !== 0) return generationDifference;
        return b.createdAt.getTime() - a.createdAt.getTime() || b.id - a.id;
      })
      .slice(skip, skip + limit)
      .map((product) => product.id);

    if (pageProductIds.length === 0) return [];

    const pageProducts = await prisma.product.findMany({
      where: { ...visibility, id: { in: pageProductIds } },
      include,
    });
    const productsById = new Map(
      pageProducts.map((product) => [product.id, product]),
    );

    return pageProductIds.flatMap((id) => {
      const product = productsById.get(id);
      return product ? [product] : [];
    });
  };

  const [totalProducts, productsData] = await Promise.all([
    prisma.product.count({ where }),
    loadProducts(),
  ]);
  const products = productsData.map((product) => {
    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((acc, r) => acc + r.rating, 0) /
        product.reviews.length
        : 0;
    const isNew =
      (Date.now() - new Date(product.createdAt).getTime()) /
      (1000 * 3600 * 24) <
      7;

    let badge: { text: string; variant: "primary" | "secondary" } | undefined;
    if (isNew) badge = { text: "New", variant: "secondary" };
    else if (product.discountedPrice && product.discountedPrice < product.price)
      badge = { text: "Sale", variant: "primary" };

    const discountPercent =
      product.discountedPrice && product.discountedPrice > 0
        ? product.discountedPrice
        : null;
    const finalPrice = discountPercent
      ? product.price - (product.price * discountPercent) / 100
      : product.price;

    return {
      id: product.id,
      slug: product.slug ?? undefined,
      name: product.title,
      price: finalPrice,
      oldPrice: discountPercent ? product.price : undefined,
      category: product.category?.title || "Uncategorized",
      image: product.images[0] || "/images/placeholder-product.jpg",
      images:
        product.images.length > 0
          ? product.images
          : ["/images/placeholder-product.jpg"],
      description: product.description,
      rating: avgRating,
      reviews: product.reviews.length,
      quantity: product.quantity,
      badge,
    };
  });

  return { products, totalProducts, categoryIds, laptopGenerations, search };
}
