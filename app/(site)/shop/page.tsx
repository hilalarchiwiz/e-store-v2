import Breadcrumbs from "@/components/v2/Breadcrumbs";
import FilterSidebar from "@/components/v2/FilterSidebar";
import ShopContent from "@/components/v2/ShopContent";
import prisma from "@/lib/prisma";
import { Metadata } from "next";
import Script from "next/script";

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

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  const params = await searchParams;
  const search = params.search?.trim() || "";
  const categoryParam = params.category;
  const brandParam = params.brand;

  let title = "Shop Premium Laptops, Tablets & PC Essentials | Qaam.pk";
  let description = "Explore our extensive collection of high-performance laptops, tablets, and computing gear at Qaam.pk. Find the perfect tech for work, gaming, and home.";

  if (search) {
    title = `Search results for "${search}" | Qaam.pk`;
    description = `Browse the best deals for "${search}" at Qaam.pk. High-quality computing products at competitive prices.`;
  } else if (categoryParam) {
    const parts = categoryParam.split(",");
    const firstPart = parts[0];
    let categoryName = firstPart;

    if (!isNaN(Number(firstPart))) {
      const category = await prisma.category.findUnique({
        where: { id: Number(firstPart) },
        select: { title: true }
      });
      if (category) categoryName = category.title;
    }

    title = `${categoryName} - Premium Tech Collection | Qaam.pk`;
    description = `Shop the latest ${categoryName} at Qaam.pk. Discover high-performance options tailored for your needs.`;
  } else if (brandParam) {
    const parts = brandParam.split(",");
    const firstPart = parts[0];
    let brandName = firstPart;

    if (!isNaN(Number(firstPart))) {
      const brand = await prisma.brand.findUnique({
        where: { id: Number(firstPart) },
        select: { title: true }
      });
      if (brand) brandName = brand.title;
    }

    title = `Premium ${brandName} Products | Qaam.pk`;
    description = `Discover the complete range of ${brandName} tech products at Qaam.pk. Quality guaranteed with official warranty.`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://qaam.pk/shop${search ? `?search=${search}` : ""}`,
      siteName: "Qaam.pk",
      images: [{ url: "/images/og-image.png" }],
      type: "website",
    },
    alternates: {
      canonical: "/shop",
    },
  };
}

const ShopPage = async ({ searchParams }: ShopPageProps) => {
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const PAGE_SIZE = 12;
  const skip = (currentPage - 1) * PAGE_SIZE;

  const categoryParam = resolvedSearchParams.category;
  let categoryIds: number[] = [];
  if (categoryParam) {
    const parts = categoryParam.split(",");
    const numeric = parts.map(Number).filter((n) => !isNaN(n));
    const strings = parts.filter((p) => isNaN(Number(p)));
    categoryIds = [...numeric];
    if (strings.length > 0) {
      const found = await prisma.category.findMany({
        where: { OR: strings.map(s => ({ title: { equals: s, mode: 'insensitive' } })) },
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
        include: {
          _count: {
            select: {
              products: { where: { status: "active" } },
            },
          },
        },
      }),
      prisma.brand.findMany({
        where: { status: "active" },
        include: {
          _count: {
            select: {
              products: { where: { status: "active" } },
            },
          },
        },
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
    <main className="flex-1 max-w-400 mx-auto w-full px-6 md:px-10  py-6 md:py-10 flex flex-col gap-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
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

      {/* Structured Data for CollectionPage */}
      <Script
        id="shop-collection-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": search ? `Search results for "${search}"` : "Premium Tech Catalog",
            "description": "Browse our complete catalog of high-performance laptops, tablets, and PC accessories.",
            "url": `https://qaam.pk/shop${search ? `?search=${search}` : ""}`,
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": products.length,
              "itemListElement": products.map((p, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": `https://qaam.pk/product/${p.id}`,
                "name": p.name,
                "image": `https://qaam.pk${p.image}`
              }))
            }
          }),
        }}
      />
    </main>
  );
};

export default ShopPage;
