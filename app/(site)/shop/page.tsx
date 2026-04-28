import Breadcrumbs from "@/components/v2/Breadcrumbs";
import FilterSidebar from "@/components/v2/FilterSidebar";
import ShopContent from "@/components/v2/ShopContent";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface ShopPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    search?: string;
  }>;
}

const ShopPage = async ({ searchParams }: ShopPageProps) => {
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const PAGE_SIZE = 12;
  const skip = (currentPage - 1) * PAGE_SIZE;

  const categoryIds = resolvedSearchParams.category
    ? resolvedSearchParams.category
      .split(",")
      .map(Number)
      .filter((n) => !isNaN(n))
    : [];

  const brandIds = resolvedSearchParams.brand
    ? resolvedSearchParams.brand
      .split(",")
      .map(Number)
      .filter((n) => !isNaN(n))
    : [];

  const sort = resolvedSearchParams.sort || "newest";
  const search = resolvedSearchParams.search?.trim() || "";

  const where: any = { status: "active" };

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

  let orderBy: any = { createdAt: "desc" };
  if (sort === "price_asc") orderBy = { price: "asc" };
  if (sort === "price_desc") orderBy = { price: "desc" };
  if (sort === "oldest") orderBy = { createdAt: "asc" };

  const [totalProducts, productsData, categoriesData, brandsData, priceStats] =
    await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: { category: true, reviews: true },
        take: PAGE_SIZE,
        skip,
        orderBy,
      }),
      prisma.category.findMany({
        where: { status: "active" },
        include: { _count: { select: { products: true } } },
      }),
      prisma.brand.findMany({
        where: { status: "active" },
        include: { _count: { select: { products: true } } },
      }),
      prisma.product.aggregate({
        where: { status: "active" },
        _max: { price: true },
      }),
    ]);

  const categories = categoriesData.map((c) => ({
    id: c.id,
    title: c.title,
    count: c._count.products,
  }));

  const brands = brandsData.map((b) => ({
    id: b.id,
    title: b.title,
    count: b._count.products,
  }));

  const dbMaxPrice = Math.ceil(priceStats._max.price || 1000);

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
      badge,
    };
  });

  const totalPages = Math.ceil(totalProducts / PAGE_SIZE);

  return (
    <main className="flex-1 max-w-300 mx-auto w-full  py-6 md:py-10 flex flex-col gap-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/v2" },
          { label: "Shop", href: "/v2/shop" },
          { label: search ? `Search: "${search}"` : "All Products" },
        ]}
      />

      <div className="flex flex-col lg:flex-row gap-8">
        <FilterSidebar
          categories={categories}
          brands={brands}
          minPrice={0}
          maxPrice={dbMaxPrice}
        />

        <ShopContent
          products={products}
          totalProducts={totalProducts}
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </div>
    </main>
  );
};

export default ShopPage;
