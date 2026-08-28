import prisma from "@/lib/prisma";
import { Metadata } from "next";
import ProductCard from "@/components/v2/ProductCard";

export const metadata: Metadata = {
  title: "Qaam.pk | Premium Laptops, Tablets & PC Essentials",
  description:
    "Upgrade your workspace with high-performance laptops, tablets, and PC gear. Discover the latest tech, new arrivals, and exclusive deals at Ecomare.",
  keywords: [
    "laptops",
    "tablets",
    "gaming pc",
    "computer hardware",
    "tech store",
    "desktops",
    "Ecomare",
    "PC accessories",
    "high-performance computing",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Qaam.pk | Premium Laptops, Tablets & PC Essentials",
    description:
      "Upgrade your workspace with high-performance laptops, tablets, and PC gear. Curated for quality and power.",
    url: "https://qaam.pk",
    siteName: "Qaam.pk",
    images: [
      {
        url: "/images/hero/hero-bg.png",
        width: 1200,
        height: 630,
        alt: "Qaam.pk - Premium Laptops & Tech Gear",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Qaam.pk | Laptops, Tablets & PC Essentials",
    description:
      "High-performance tech for work and play. Upgrade your home with the latest laptops and tablets.",
    images: ["/images/og-image.png"],
  },
  alternates: {
    canonical: "/",
  },
};

export default async function V2HomePage() {
  // Fetch all active products in the Laptop category
  const laptopsData = await prisma.product.findMany({
    where: {
      status: "active",
      category: {
        title: {
          contains: "Laptop",
          mode: "insensitive",
        },
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      reviews: {
        select: { rating: true },
      },
    },
  });

  const laptops = laptopsData.map((product) => {
    const discountPercent =
      product.discountedPrice && product.discountedPrice > 0
        ? product.discountedPrice
        : null;
    const finalPrice = discountPercent
      ? product.price - (product.price * discountPercent) / 100
      : product.price;

    const rating =
      product.reviews.length > 0
        ? product.reviews.reduce((acc, curr) => acc + curr.rating, 0) /
          product.reviews.length
        : 0;

    return {
      id: product.id,
      slug: product.slug ?? undefined,
      name: product.title,
      price: finalPrice,
      oldPrice: discountPercent ? product.price : undefined,
      discountedPrice: product.discountedPrice ?? null,
      description: product.description,
      image: product.images[0] || "/images/placeholder-product.jpg",
      images:
        product.images.length > 0
          ? product.images
          : ["/images/placeholder-product.jpg"],
      inStock: product.quantity > 0,
      isNew:
        (new Date().getTime() - new Date(product.createdAt).getTime()) /
          (1000 * 3600 * 24) <
        7,
      rating,
      reviews: product.reviews.length,
    };
  });

  return (
    <main className="max-w-400 mx-auto pb-20 md:px-10 px-2">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Ecomare",
            url: "https://qaam.pk",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://qaam.pk/shop?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />

      {/* Laptops Section */}
      <section className="py-12">
        {/* Header */}
        <div className="flex justify-between items-end sm:items-center mb-6 sm:mb-10 gap-2">
          <div>
            <p className="text-primary text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1 sm:mb-2">
              Our Collection
            </p>
            <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-[#121714] dark:text-white">
              Laptops
            </h1>
            <div className="w-8 sm:w-12 h-0.75 bg-primary rounded-full mt-2 sm:mt-3" />
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0 pb-1">
            {laptops.length} product{laptops.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Grid */}
        {laptops.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {laptops.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                slug={product.slug}
                name={product.name}
                price={product.price}
                oldPrice={product.oldPrice}
                discountedPrice={product.discountedPrice ?? undefined}
                image={product.image}
                images={product.images}
                description={product.description}
                category="Laptop"
                rating={product.rating}
                reviews={product.reviews}
                quantity={product.inStock ? 1 : 0}
                badge={
                  product.isNew
                    ? { text: "New", variant: "secondary" }
                    : product.oldPrice
                    ? { text: "Sale", variant: "primary" }
                    : undefined
                }
                layout="grid"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-4">
              laptop
            </span>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
              No laptops available right now.
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              Check back soon for new arrivals.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
