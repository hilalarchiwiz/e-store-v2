import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getStorefrontProductFilter } from "@/lib/storefront-products";

function url(value: string | undefined, request: NextRequest): string | null {
  if (!value) return null;
  try { return new URL(value, request.nextUrl.origin).toString(); } catch { return null; }
}

function productDto(product: {
  id: number; slug: string | null; title: string; description: string; price: number;
  discountedPrice: number | null; quantity: number; images: string[]; createdAt: Date;
  reviews: { rating: number }[]; _count?: { orderItems: number };
}, request: NextRequest) {
  const discount = product.discountedPrice && product.discountedPrice > 0 ? product.discountedPrice : null;
  const images = product.images.map((image) => url(image, request)).filter((image): image is string => image !== null);
  return {
    id: product.id, slug: product.slug, name: product.title, description: product.description,
    price: discount ? product.price - product.price * discount / 100 : product.price,
    oldPrice: discount ? product.price : null, discountPercent: discount,
    image: images[0] ?? null, images, inStock: product.quantity > 0, stockQuantity: product.quantity,
    isNew: Date.now() - product.createdAt.getTime() < 7 * 86_400_000,
    rating: product.reviews.length ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length : 0,
    reviewCount: product.reviews.length, soldCount: product._count?.orderItems ?? 0,
  };
}

export async function GET(request: NextRequest) {
  try {
    const visibility = await getStorefrontProductFilter();
    const laptopFilter = { ...visibility, category: { title: { equals: "Laptops", mode: "insensitive" as const } } };
    const [newRecords, sellerRecords, reviewRecords] = await Promise.all([
      prisma.product.findMany({ where: laptopFilter, orderBy: { createdAt: "desc" }, take: 8, include: { reviews: { select: { rating: true } }, _count: { select: { orderItems: true } } } }),
      prisma.product.findMany({ where: laptopFilter, orderBy: { orderItems: { _count: "desc" } }, take: 12, include: { reviews: { select: { rating: true } }, _count: { select: { orderItems: true } } } }),
      prisma.review.findMany({ where: { product: visibility }, orderBy: { createdAt: "desc" }, take: 8, select: { id: true, name: true, rating: true, comment: true, product: { select: { title: true } } } }),
    ]);
    return NextResponse.json({
      newArrivals: newRecords.map((product) => productDto(product, request)),
      bestSellers: sellerRecords.map((product) => productDto(product, request)),
      reviews: reviewRecords.map((review) => ({ id: review.id, name: review.name ?? "Anonymous", rating: review.rating, comment: review.comment, productName: review.product.title })),
    }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600" } });
  } catch (error) {
    console.error("Failed to load mobile home content", error);
    return NextResponse.json({ error: "Unable to load home content" }, { status: 500 });
  }
}
