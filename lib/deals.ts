import prisma from "@/lib/prisma";
import { getStorefrontProductFilter } from "@/lib/storefront-products";

export interface DealProduct {
  id: number; slug?: string; name: string; price: number; oldPrice: number;
  discountedPrice: number; category: string; categoryId: number; image: string;
  images: string[]; description?: string; rating: number; reviews: number;
  quantity: number; badge: { text: string; variant: "primary" };
}

export async function getDealProducts(): Promise<DealProduct[]> {
  const visibility = await getStorefrontProductFilter();
  const products = await prisma.product.findMany({
    where: { ...visibility, discountedPrice: { gt: 0 } },
    orderBy: [{ discountedPrice: "desc" }, { createdAt: "desc" }],
    include: {
      category: { select: { id: true, title: true } },
      reviews: { select: { rating: true } },
    },
  });

  return products.map((product) => {
    const discount = product.discountedPrice || 0;
    const rating = product.reviews.length
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0;
    return {
      id: product.id, slug: product.slug ?? undefined, name: product.title,
      price: product.price - (product.price * discount) / 100,
      oldPrice: product.price, discountedPrice: discount,
      category: product.category?.title || "Other", categoryId: product.category?.id || 0,
      image: product.images[0] || "/images/placeholder-product.jpg",
      images: product.images.length ? product.images : ["/images/placeholder-product.jpg"],
      description: product.description, rating, reviews: product.reviews.length,
      quantity: product.quantity,
      badge: { text: `-${Math.round(discount)}%`, variant: "primary" as const },
    };
  });
}

export function getDealCategories(products: DealProduct[]) {
  return Array.from(new Map(products.filter((product) => product.categoryId > 0).map((product) => [
    product.categoryId, { id: product.categoryId, title: product.category },
  ])).values());
}
