"use client";

import React from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";

interface Product {
  id: number;
  slug?: string;
  name: string;
  price: number;
  oldPrice?: number;
  discountedPrice?: number | null;
  description?: string;
  image: string;
  images: string[];
  inStock?: boolean;
  isNew: boolean;
  rating: number;
  reviews: number;
  soldCount: number;
}

interface BestSellersProps {
  products: Product[];
}

const BestSellers: React.FC<BestSellersProps> = ({ products = [] }) => {
  return (
    <section className="py-12">
      {/* Header */}
      <div className="flex justify-between items-end sm:items-center mb-6 sm:mb-10 gap-2">
        <div>
          <p className="text-primary text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1 sm:mb-2 whitespace-nowrap">
            Top Picks
          </p>
          <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-foreground dark:text-foreground whitespace-nowrap">
            Best Sellers
          </h2>
          <div className="w-8 sm:w-12 h-0.75 bg-primary rounded-full mt-2 sm:mt-3" />
        </div>
        <Link
          href="/shop"
          className="text-primary font-bold flex items-center gap-1 group text-xs sm:text-sm whitespace-nowrap shrink-0 pb-1"
        >
          View All
          <span className="material-symbols-outlined text-xs sm:text-sm group-hover:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </Link>
      </div>

      {/* Grid — 4 cols desktop, 2 mobile */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
        {products.slice(0, 12).map((product) => (
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
            category="Best Seller"
            rating={product.rating}
            reviews={product.reviews}
            quantity={product.inStock ? 1 : 0}
            badge={product.oldPrice ? { text: `Sale`, variant: "primary" } : undefined}
            layout="grid"
          />
        ))}
      </div>
    </section>
  );
};

export default BestSellers;
