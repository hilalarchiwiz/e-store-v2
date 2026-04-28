import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetails from "@/components/v2/ProductDetails";
import Breadcrumbs from "@/components/v2/Breadcrumbs";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const productId = parseInt(id);

  if (isNaN(productId)) {
    return notFound();
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: true,
      reviews: true,
    },
  });

  if (!product) {
    return notFound();
  }

  // Fetch related products from the same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: productId },
      status: "active",
    },
    take: 4,
    include: {
      category: true,
    },
  });

  return (
    <main className="max-w-[1440px] mx-auto w-full px-6 py-6 md:py-10 flex flex-col gap-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/v2" },
          { label: "Shop", href: "/v2/shop" },
          {
            label: product.category?.title || "Uncategorized",
            href: `/shop?category=${product.category?.id}`,
          },
          { label: product.title },
        ]}
      />

      <div className="bg-white dark:bg-[#1a251d] rounded-[3rem] p-8 md:p-12 shadow-xl border border-gray-100 dark:border-white/5">
        <ProductDetails
          product={{
            ...product,
            images:
              product.images.length > 0
                ? product.images
                : ["/images/placeholder-product.jpg"],
            rating:
              product.reviews.reduce((acc, r) => acc + r.rating, 0) /
              product.reviews.length || 0,
            reviews: product.reviews.length,
            reviewsList: product.reviews,
          }}
          relatedProducts={relatedProducts}
        />
      </div>
    </main>
  );
}
