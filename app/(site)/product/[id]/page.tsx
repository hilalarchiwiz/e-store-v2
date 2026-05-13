import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetails from "@/components/v2/ProductDetails";
import Breadcrumbs from "@/components/v2/Breadcrumbs";
import { Metadata } from "next";
import Script from "next/script";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const productId = parseInt(id);

  if (isNaN(productId)) return {};

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { category: true }
  });

  if (!product) return {};

  const title = `${product.title} | Qaam.pk`;
  const description = product.description?.substring(0, 160) || `Buy ${product.title} at Qaam.pk. Discover high-performance tech and premium PC gear.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://qaam.pk/product/${id}`,
      siteName: "Qaam.pk",
      images: [
        {
          url: product.images[0] || "/images/og-image.png",
          alt: product.title,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.images[0] || "/images/og-image.png"],
    },
  };
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
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
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

      {/* Product Structured Data */}
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.title,
            "image": product.images.map(img => `https://qaam.pk${img}`),
            "description": product.description,
            "brand": {
              "@type": "Brand",
              "name": "Qaam.pk"
            },
            "offers": {
              "@type": "Offer",
              "url": `https://qaam.pk/product/${id}`,
              "priceCurrency": "PKR",
              "price": product.discountedPrice || product.price,
              "availability": product.quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "itemCondition": "https://schema.org/NewCondition"
            },
            ...(product.reviews.length > 0 ? {
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length,
                "reviewCount": product.reviews.length
              }
            } : {})
          }),
        }}
      />
    </main>
  );
}
