import { getHeroImageBounds } from "@/lib/hero-image-bounds";
import type { HeroImageBounds } from "@/lib/hero-image-layout";
import { getStorefrontProductFilter } from "@/lib/storefront-products";
import Hero from "@/components/v2/Hero";
import CategorySlider from "@/components/v2/CategorySlider";
import NewArrivals from "@/components/v2/NewArrivals";
import Banners from "@/components/v2/Banners";
import BestSellers from "@/components/v2/BestSellers";
import HomepageFlashSale from "@/components/v2/HomepageFlashSale";
import BestDeals from "@/components/v2/BestDeals";
import StoreBenefits from "@/components/v2/StoreBenefits";
import Feedback from "@/components/v2/Feedback";
import Subscribe from "@/components/v2/Subscribe";
import prisma from "@/lib/prisma";
import { getLatestReviews } from "@/lib/action/review.action";
import { Metadata } from "next";
import ShopBenefits from "@/components/v2/ShopBenefits";
import DynamicIcon from "@/components/v2/DynamicIcon";
import { getDealCategories, getDealProducts } from "@/lib/deals";

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
  imageBounds?: HeroImageBounds | null;
  id: number;
  title: string;
  description: string;
  img: string;
  link: string | null;
};

export default async function V2HomePage() {
  const visibility = await getStorefrontProductFilter();
  const categoriesData = await prisma.category.findMany({
    where: {
      status: "active",
      products: {
        some: {
          ...visibility
        }
      }
    },
    orderBy: [
      { order_number: "asc" }, // nulls will sort last by default in most DBs
    ],
    include: {
      _count: {
        select: {
          products: {
            where: visibility,
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
    where: {
      ...visibility,
      category: {
        title: {
          equals: "Laptops",
          mode: "insensitive",
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: {
      reviews: {
        select: { rating: true }
      }
    }
  });

  const newArrivals = newArrivalsData.map((product) => {
    const discountPercent =
      product.discountedPrice && product.discountedPrice > 0
        ? product.discountedPrice
        : null;
    const finalPrice = discountPercent
      ? product.price - (product.price * discountPercent) / 100
      : product.price;

    const rating = product.reviews.length > 0
      ? product.reviews.reduce((acc, curr) => acc + curr.rating, 0) / product.reviews.length
      : 0;

    return {
      id: product.id,
      slug: product.slug ?? undefined,
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
      rating: rating,
      reviews: product.reviews.length,
    };
  });

  const banners = await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    take: 3,
  });

  const bestSellersData = await prisma.product.findMany({
    where: {
      ...visibility,
      category: {
        title: {
          equals: "Laptops",
          mode: "insensitive",
        },
      },
    },
    orderBy: { orderItems: { _count: "desc" } },
    take: 12,
    include: {
      reviews: {
        select: { rating: true }
      },
      _count: {
        select: { orderItems: true }
      }
    }
  });

  const bestSellers = bestSellersData.map((product) => {
    const discountPercent =
      product.discountedPrice && product.discountedPrice > 0
        ? product.discountedPrice
        : null;
    const finalPrice = discountPercent
      ? product.price - (product.price * discountPercent) / 100
      : product.price;

    const rating = product.reviews.length > 0
      ? product.reviews.reduce((acc, curr) => acc + curr.rating, 0) / product.reviews.length
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
      rating: rating,
      reviews: product.reviews.length,
      soldCount: product._count.orderItems,
    };
  });

  const latestReviews = await getLatestReviews(8);
  const dealProducts = await getDealProducts();
  const dealCategories = getDealCategories(dealProducts);

  const slidersData = await prisma.slider.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "asc" },
  });

  const slides: HeroSlide[] = await Promise.all(slidersData.map(async (s) => ({
    imageBounds: await getHeroImageBounds(s.img, s.updatedAt.toISOString()),
    id: s.id,
    title: s.title,
    description: s.description,
    img: s.img,
    link: s.link ?? null,
  })));
  const DEFAULT_STATS = [
  { value: '10,000+', label: 'Products Sold', detail: 'Across Pakistan', icon: 'ShoppingBag' },
  { value: '5,000+', label: 'Happy Customers', detail: 'And growing', icon: 'UsersRound' },
  { value: 'Checked & Tested', label: 'By Tech Experts', detail: 'Quality assured', icon: 'ShieldCheck' },
  { value: 'Nationwide', label: 'Delivery', detail: 'At your doorstep', icon: 'Truck' },
];
  const stats = DEFAULT_STATS.map((item, index) => ({
    value: item.value,
    label: item.label,
    detail: item.detail,
    icon: item.icon,
  }));

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
      <BestDeals products={dealProducts} categories={dealCategories} />
     <section aria-label="QAAM at a glance" className="rounded-xl surface dark:surface border border-black/5 bg-surface px-1 py-3 shadow-[0_8px_30px_rgba(0,0,0,.10)] dark:border-white/10 dark:bg-surface sm:rounded-2xl sm:p-6">
               <div className="grid grid-cols-4 gap-0">
                 {stats.map((stat, index) => (
                   <div key={`${stat.label}-${index}`} className="flex min-w-0 flex-col items-center justify-center gap-1 border-r border-black/10 px-1 text-center last:border-r-0 dark:border-white/10 sm:flex-row sm:gap-3 sm:px-4 sm:text-left lg:px-7">
                     <span className="shrink-0 text-primary">
                       <DynamicIcon name={stat.icon} fallback="BadgeCheck" size={24} />
                     </span>
                     <div className="min-w-0">
                       <p className="break-words text-[8px] font-black leading-tight sm:text-lg lg:text-xl">{stat.value}</p>
                       <p className="mt-0.5 break-words text-[7px] font-semibold leading-tight text-muted dark:text-white/65 sm:mt-1 sm:text-xs lg:text-sm">{stat.label}</p>
                       <span className="sr-only">{stat.detail}</span>
                     </div>
                   </div>
                 ))}
               </div>
             </section>
      <HomepageFlashSale />
      <StoreBenefits />
      <Feedback reviews={latestReviews} />
      <Subscribe />
    </main>
  );
}
