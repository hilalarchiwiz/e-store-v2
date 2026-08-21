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
    generation?: string;
  }>;
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
      where: { categoryId: categoryIds[0], status: "active" },
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
        take: PAGE_SIZE,
        skip,
        orderBy,
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
        return b.createdAt.getTime() - a.createdAt.getTime();
      })
      .slice(skip, skip + PAGE_SIZE)
      .map((product) => product.id);

    if (pageProductIds.length === 0) return [];

    const pageProducts = await prisma.product.findMany({
      where: { id: { in: pageProductIds } },
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

  const [
    totalProducts,
    productsData,
    categoriesData,
    brandsData,
    priceStats,
    fallbackBanner,
    shopBannerSettingRecord,
  ] =
    await Promise.all([
      prisma.product.count({ where }),
      loadProducts(),
      prisma.category.findMany({
        where: {
          status: "active",
          products: {
            some: {
              status: "active"
            }
          },
        },
        include: {
          _count: {
            select: {
              products: {
                where: {
                  status: "active"
                }
              },
            },
          },
        },
        orderBy: { order_number: "asc" },
      }),
      prisma.brand.findMany({
        where: {
          status: "active", products: {
            some: {
              status: "active"
            }
          },
        },
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
      prisma.banner.findFirst({
        where: { isActive: true },
        orderBy: { order: "asc" },
      }),
      prisma.setting.findUnique({
        where: { key: "shop_banner" },
      }),
    ]);

  let shopBannerSetting: {
    image?: string;
    title?: string;
    link?: string;
    bgColor?: string;
  } = {};

  if (shopBannerSettingRecord?.value) {
    try {
      shopBannerSetting = JSON.parse(shopBannerSettingRecord.value);
    } catch {
      shopBannerSetting = {};
    }
  }

  const shopBannerImage =
    shopBannerSetting.image || fallbackBanner?.imageUrl || "";
  const shopBanner = shopBannerImage
    ? {
        title:
          shopBannerSetting.title || fallbackBanner?.title || "Shop banner",
        description: fallbackBanner?.description || null,
        buttonText: fallbackBanner?.buttonText || null,
        link: shopBannerSetting.link || fallbackBanner?.link || "/shop",
        imageUrl: shopBannerImage,
        bgColor:
          shopBannerSetting.bgColor || fallbackBanner?.bgColor || "#F2F3F2",
      }
    : null;

  const categories = categoriesData.map((c) => ({
    id: c.id,
    title: c.title,
    count: c._count.products,
    image: c.img || "/images/categories/categories-01.png",
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
      // This is a request-time server component; the current time is not used in a client render.
      // eslint-disable-next-line react-hooks/purity
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
      quantity: product.quantity,
      badge,
    };
  });

  const totalPages = Math.ceil(totalProducts / PAGE_SIZE);

  return (
    <main className="mx-auto flex w-full max-w-400 flex-1 flex-col gap-8 overflow-x-clip px-4 py-6 sm:px-6 md:px-10 md:py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: search ? `Search: "${search}"` : "All Products" },
        ]}
      />

      <div className="flex w-full min-w-0 max-w-full flex-col gap-8 lg:flex-row">
        <FilterSidebar
          categories={categories}
          brands={brands}
          generations={laptopGenerations}
          minPrice={0}
          maxPrice={dbMaxPrice}
        />

        <ShopContent
          products={products}
          totalProducts={totalProducts}
          currentPage={currentPage}
          totalPages={totalPages}
          banner={shopBanner}
          categories={categories}
          selectedCategoryIds={categoryIds}
          brands={brands}
          generations={laptopGenerations}
          minPrice={0}
          maxPrice={dbMaxPrice}
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
