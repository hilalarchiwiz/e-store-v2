import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getStorefrontProductFilter } from "@/lib/storefront-products";

function imageUrl(value: string, request: NextRequest): string | null {
  try { return new URL(value, request.nextUrl.origin).toString(); } catch { return null; }
}

function summary(product: {
  id: number; slug: string | null; title: string; description: string; warranty: string;
  price: number; discountedPrice: number | null; quantity: number; images: string[];
  specifications: unknown; category: { id: number; title: string; slug: string | null } | null;
  grading: { id: number; title: string; description: string | null } | null;
  reviews: { id?: number; name?: string | null; rating: number; comment?: string }[];
}, request: NextRequest) {
  const discount = product.discountedPrice && product.discountedPrice > 0 ? product.discountedPrice : null;
  const images = product.images.map((image) => imageUrl(image, request)).filter((image): image is string => image !== null);
  return {
    id: product.id, slug: product.slug, name: product.title, description: product.description,
    warranty: product.warranty, specifications: product.specifications, category: product.category,
    grading: product.grading, images, image: images[0] ?? null, stockQuantity: product.quantity,
    inStock: product.quantity > 0, discountPercent: discount, oldPrice: discount ? product.price : null,
    price: discount ? product.price - product.price * discount / 100 : product.price,
    rating: product.reviews.length ? product.reviews.reduce((total, review) => total + review.rating, 0) / product.reviews.length : 0,
    reviewCount: product.reviews.length,
  };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const numericId = Number(id);
    const visibility = await getStorefrontProductFilter();
    const product = await prisma.product.findFirst({
      where: { ...visibility, OR: [{ slug: id }, ...(Number.isSafeInteger(numericId) ? [{ id: numericId }] : [])] },
      include: { category: { select: { id: true, title: true, slug: true } }, grading: { select: { id: true, title: true, description: true } }, reviews: { orderBy: { createdAt: "desc" }, select: { id: true, name: true, rating: true, comment: true } } },
    });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const related = await prisma.product.findMany({
      where: { ...visibility, id: { not: product.id }, ...(product.categoryId ? { categoryId: product.categoryId } : {}) },
      take: 4,
      include: { category: { select: { id: true, title: true, slug: true } }, grading: { select: { id: true, title: true, description: true } }, reviews: { select: { rating: true } } },
    });

    return NextResponse.json({
      product: { ...summary(product, request), reviewsList: product.reviews.map((review) => ({ id: review.id, name: review.name ?? "Anonymous", rating: review.rating, comment: review.comment })) },
      relatedProducts: related.map((item) => summary(item, request)),
    }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch (error) {
    console.error("Failed to load product details", error);
    return NextResponse.json({ error: "Unable to load product" }, { status: 500 });
  }
}
