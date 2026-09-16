import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getShopProducts } from "@/lib/shop-products";
import { getStorefrontProductFilter } from "@/lib/storefront-products";

function publicUrl(value: string | null | undefined, request: NextRequest) {
  if (!value) return null;
  try {
    return new URL(value, request.nextUrl.origin).toString();
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const offsetValue = Number(searchParams.get("offset") ?? 0);
  const limitValue = Number(searchParams.get("limit") ?? 20);

  if (!Number.isSafeInteger(offsetValue) || offsetValue < 0) {
    return NextResponse.json({ error: "Invalid offset" }, { status: 400 });
  }

  const limit = Math.min(Math.max(Number.isSafeInteger(limitValue) ? limitValue : 20, 1), 40);

  try {
    const filters = Object.fromEntries(searchParams);
    const visibility = await getStorefrontProductFilter();
    const [
      { products, totalProducts, laptopGenerations },
      categories,
      brands,
      priceStats,
      fallbackBanner,
      bannerSettingRecord,
    ] = await Promise.all([
        getShopProducts(filters, offsetValue, limit),
        prisma.category.findMany({
          where: {
            status: "active",
            products: { some: visibility },
          },
          orderBy: [{ order_number: "asc" }, { title: "asc" }],
          select: {
            id: true,
            title: true,
            slug: true,
            img: true,
            _count: { select: { products: { where: visibility } } },
          },
        }),
        prisma.brand.findMany({
          where: {
            status: "active",
            products: { some: visibility },
          },
          orderBy: { title: "asc" },
          select: {
            id: true,
            title: true,
            _count: { select: { products: { where: visibility } } },
          },
        }),
        prisma.product.aggregate({
          where: visibility,
          _max: { price: true },
        }),
        prisma.banner.findFirst({
          where: { isActive: true },
          orderBy: { order: "asc" },
        }),
        prisma.setting.findUnique({ where: { key: "shop_banner" } }),
      ]);

    let bannerSetting: {
      image?: string;
      title?: string;
      link?: string;
      bgColor?: string;
    } = {};
    if (bannerSettingRecord?.value) {
      try {
        bannerSetting = JSON.parse(bannerSettingRecord.value);
      } catch {
        bannerSetting = {};
      }
    }
    const bannerImage = bannerSetting.image || fallbackBanner?.imageUrl;

    return NextResponse.json(
      {
        products: products.map((product) => ({
          ...product,
          image: publicUrl(product.image, request),
          images: (product.images ?? [])
            .map((image) => publicUrl(image, request))
            .filter((image): image is string => image !== null),
          categoryName: product.category,
          reviewCount: product.reviews,
          stockQuantity: product.quantity,
          inStock: product.quantity > 0,
          badgeText: product.badge?.text ?? null,
        })),
        totalProducts,
        hasMore: offsetValue + products.length < totalProducts,
        banner: bannerImage
          ? {
              title:
                bannerSetting.title || fallbackBanner?.title || "Shop banner",
              description: fallbackBanner?.description ?? null,
              link: bannerSetting.link || fallbackBanner?.link || "/shop",
              image: publicUrl(bannerImage, request),
              backgroundColor:
                bannerSetting.bgColor ||
                fallbackBanner?.bgColor ||
                "#F2F3F2",
            }
          : null,
        filters: {
          categories: categories.map((category) => ({
            id: category.id,
            title: category.title,
            slug: category.slug,
            image: publicUrl(category.img, request),
            count: category._count.products,
          })),
          brands: brands.map((brand) => ({
            id: brand.id,
            title: brand.title,
            count: brand._count.products,
          })),
          generations: laptopGenerations,
          minPrice: 0,
          maxPrice: Math.ceil(priceStats._max.price ?? 0),
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=180",
        },
      },
    );
  } catch (error) {
    console.error("Failed to load mobile storefront shop", error);
    return NextResponse.json(
      { error: "Unable to load shop products" },
      { status: 500 },
    );
  }
}
