import { getStorefrontProductFilter } from "@/lib/storefront-products";
import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetails from "@/components/v2/ProductDetails";
import Breadcrumbs from "@/components/v2/Breadcrumbs";
import { Metadata } from "next";
import Script from "next/script";
import SeoContent from "@/components/v2/SeoContent";
import {
  absoluteUrl,
  createPublicMetadata,
  metaDescription,
  productMetaTitle,
} from "@/lib/seo";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const numericId = !isNaN(Number(slug)) ? Number(slug) : undefined;

  const product = await prisma.product.findFirst({
    where: {
      ...await getStorefrontProductFilter(),
      OR: [
        { slug: slug },
        ...(numericId ? [{ id: numericId }] : []),
      ],
    },
    include: { brand: true, category: true, grading: true },
  });

  if (!product) return {};

  const title = productMetaTitle(product.title);
  const description = metaDescription(
    product.description,
    `Buy ${product.title} at Qaam.pk with nationwide delivery in Pakistan.`,
  );
  const canonicalSlug = product.slug || product.id.toString();

  return createPublicMetadata({
    title,
    description,
    path: `/product/${canonicalSlug}`,
    image: product.images[0],
  });
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const numericId = !isNaN(Number(slug)) ? Number(slug) : undefined;

  const product = await prisma.product.findFirst({
    where: {
      ...await getStorefrontProductFilter(),
      OR: [
        { slug: slug },
        ...(numericId ? [{ id: numericId }] : []),
      ],
    },
    include: {
      category: true,
      brand: true,
      reviews: true,
      grading: true,
    },
  });

  if (!product) {
    return notFound();
  }

  // Fetch related products from the same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      ...await getStorefrontProductFilter(),
    },
    take: 4,
    include: {
      category: true,
      reviews: { select: { rating: true } },
    },
  });

  const categorySlugOrId = product.category?.slug || product.category?.id;
  const discountPercent =
    product.discountedPrice && product.discountedPrice > 0
      ? product.discountedPrice
      : 0;
  const salePrice = product.price - (product.price * discountPercent) / 100;
  const canonicalProductUrl = absoluteUrl(`/product/${product.slug || product.id}`);

  return (
    <main className="max-w-400 mx-auto w-full px-6 py-6 md:py-10 md:px-10 flex flex-col gap-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          {
            label: product.category?.title || "Uncategorized",
            href: categorySlugOrId ? `/shop?category=${categorySlugOrId}` : "/shop",
          },
          { label: product.title },
        ]}
      />

      <div className="bg-surface dark:bg-surface rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-12 dark:border-white/5">
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

      <SeoContent
        eyebrow="Product buying guide"
        title={`About this ${product.category?.title || "product"}`}
        paragraphs={[
          `${product.title} is listed in our ${product.category?.title || "technology"} range${product.brand?.title ? ` from ${product.brand.title}` : ""}. Review the price, stock status, images and specifications above before ordering. Product names can cover several features or compatible model numbers, so the detailed information on this page should be used to confirm that the item suits your intended system and everyday requirements.`,
          `When comparing this item with similar products, consider the features that affect practical use rather than price alone. For computers, those details commonly include processor generation, installed memory, storage, display and graphics capability. For batteries, chargers and replacement parts, match the listed model or compatibility information with your existing device. If a required detail is not shown clearly, contact Qaam.pk before purchase so our team can help verify it.`,
          `${product.quantity > 0 ? "This product is currently shown as available" : "This product is currently shown as out of stock"}, and availability may change as orders are processed. Qaam.pk supplies new and refurbished computing equipment to customers across Pakistan. Refurbished items may show a condition or grading description, while each listing provides the information available for that individual item. Check the order details carefully and read our returns information before completing your purchase.`,
        ]}
        links={[
          { href: "/shop", label: "Browse all products" },
          ...(categorySlugOrId
            ? [{ href: `/shop?category=${categorySlugOrId}`, label: `More ${product.category?.title || "products"}` }]
            : []),
          { href: "/returns-exchanges", label: "Returns and exchanges" },
          { href: "/contact", label: "Ask about this product" },
        ]}
      />

      {/* Product Structured Data */}
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Product",
                "@id": `${canonicalProductUrl}#product`,
                name: product.title,
                image: product.images.map(absoluteUrl),
                description: metaDescription(product.description, product.title),
                sku: String(product.id),
                category: product.category?.title,
                brand: product.brand?.title
                  ? { "@type": "Brand", name: product.brand.title }
                  : undefined,
                offers: {
                  "@type": "Offer",
                  url: canonicalProductUrl,
                  priceCurrency: "PKR",
                  price: salePrice.toFixed(2),
                  availability:
                    product.quantity > 0
                      ? "https://schema.org/InStock"
                      : "https://schema.org/OutOfStock",
                  itemCondition: product.grading
                    ? "https://schema.org/UsedCondition"
                    : "https://schema.org/NewCondition",
                },
                ...(product.reviews.length > 0
                  ? {
                    aggregateRating: {
                      "@type": "AggregateRating",
                      ratingValue:
                        product.reviews.reduce((acc, r) => acc + r.rating, 0) /
                        product.reviews.length,
                      reviewCount: product.reviews.length,
                    },
                  }
                  : {}),
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl() },
                  { "@type": "ListItem", position: 2, name: "Shop", item: absoluteUrl("/shop") },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: product.title,
                    item: canonicalProductUrl,
                  },
                ],
              },
            ],
          }).replace(/</g, "\\u003c"),
        }}
      />
    </main>
  );
}
