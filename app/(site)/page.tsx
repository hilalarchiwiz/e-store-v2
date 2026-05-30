import Hero from "@/components/v2/Hero";
import CategorySlider from "@/components/v2/CategorySlider";
import NewArrivals from "@/components/v2/NewArrivals";
import Banners from "@/components/v2/Banners";
import BestSellers from "@/components/v2/BestSellers";
import Countdown from "@/components/v2/Countdown";
import Feedback from "@/components/v2/Feedback";
import Subscribe from "@/components/v2/Subscribe";
import prisma from "@/lib/prisma";
import { getLatestReviews } from "@/lib/action/review.action";
import { Metadata } from "next";

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

export type HeroSlide = {
  id: number;
  title: string;
  description: string;
  img: string;
  link: string | null;
};

export default async function V2HomePage() {
  const categoriesData = await prisma.category.findMany({
    where: { status: "active" },
    orderBy: [
      { order_number: "asc" }, // nulls will sort last by default in most DBs
    ],
    include: {
      _count: {
        select: {
          products: {
            where: { status: "active" },
          },
        },
      },
    },
  });

  const categories = categoriesData
    .sort((a, b) => (a.order_number ?? Infinity) - (b.order_number ?? Infinity))
    .map((cat) => ({
      name: cat.title,
      order_number: cat.order_number,
      count: cat._count.products,
      image: cat.img || "/images/categories/categories-01.png",
    }));
  const newArrivalsData = await prisma.product.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const newArrivals = newArrivalsData.map((product) => {
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
      discountedPrice: product.discountedPrice ?? null,
      description: product.description,
      images:
        product.images.length > 0
          ? product.images
          : ["/images/placeholder-product.jpg"],
      image: product.images[0] || "/images/placeholder-product.jpg",
      inStock: product.quantity > 0,
      isNew:
        (new Date().getTime() - new Date(product.createdAt).getTime()) /
        (1000 * 3600 * 24) <
        7,
      rating: 0,
      reviews: 0,
    };
  });

  const banners = await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    take: 3,
  });

  const bestSellersData = await prisma.product.findMany({
    where: { status: "active" },
    orderBy: { orderItems: { _count: "desc" } },
    take: 12,
  });

  const bestSellers = bestSellersData.map((product) => {
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
      discountedPrice: product.discountedPrice ?? null,
      description: product.description,
      image: product.images[0] || "/images/placeholder-product.jpg",
      images:
        product.images.length > 0
          ? product.images
          : ["/images/placeholder-product.jpg"],
      isNew:
        (new Date().getTime() - new Date(product.createdAt).getTime()) /
        (1000 * 3600 * 24) <
        7,
      rating: 5,
      reviews: 12,
      soldCount: 120,
    };
  });

  const latestReviews = await getLatestReviews(8);

  const slidersData = await prisma.slider.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "asc" },
  });

  const slides: HeroSlide[] = slidersData.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    img: s.img,
    link: s.link ?? null,
  }));

  return (
    <main className="max-w-400 mx-auto pb-20 md:px-10 px-6">
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "qaam.pk",
            url: "https://qaam.pk",
            logo: "https://qaam.pk/logo.png",
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+92-300-1234567",
              contactType: "customer service",
            },
          }),
        }}
      />
      <Hero slides={slides} />
      <CategorySlider categories={categories} />
      <NewArrivals products={newArrivals} />
      <Banners banners={banners} />
      <BestSellers products={bestSellers} />
      <Countdown />
      <Feedback reviews={latestReviews} />
      <Subscribe />
    </main>
  );
}
