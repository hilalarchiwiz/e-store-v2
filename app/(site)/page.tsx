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
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  const categories = categoriesData.map((cat) => ({
    name: cat.title,
    count: cat._count.products,
    image: cat.img || "/images/categories/categories-01.png",
  }));

  const newArrivalsData = await prisma.product.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
    take: 6,
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
      images: product.images.length > 0 ? product.images : ["/images/placeholder-product.jpg"],
      image: product.images[0] || "/images/placeholder-product.jpg",
      inStock: product.quantity > 0,
      isNew:
        (new Date().getTime() - new Date(product.createdAt).getTime()) /
        (1000 * 3600 * 24) <
        7,
      rating: 0,
      reviews: 0,
    }
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
      images: product.images.length > 0 ? product.images : ["/images/placeholder-product.jpg"],
      inStock: product.quantity > 0,
      rating: 5,
      soldCount: 120,
    }
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
    <main className="max-w-[1200px] mx-auto pb-20">
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
