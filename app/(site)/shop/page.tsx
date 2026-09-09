import Breadcrumbs from "@/components/v2/Breadcrumbs";
import FilterSidebar from "@/components/v2/FilterSidebar";
import ShopContent from "@/components/v2/ShopContent";
import prisma from "@/lib/prisma";
import { getShopProducts } from "@/lib/shop-products";
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
  const { products, totalProducts, categoryIds, laptopGenerations, search } =
    await getShopProducts(resolvedSearchParams);

  const [
    categoriesData,
    brandsData,
    priceStats,
    fallbackBanner,
    shopBannerSettingRecord,
  ] =
    await Promise.all([
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
    slug: c.slug ?? undefined,
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
          key={JSON.stringify(resolvedSearchParams)}
          filters={resolvedSearchParams}
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
