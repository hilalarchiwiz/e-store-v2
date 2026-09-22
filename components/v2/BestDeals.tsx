"use client";

import Link from "next/link";
import { useState } from "react";
import ProductCard from "@/components/v2/ProductCard";
import type { DealProduct } from "@/lib/deals";

export default function BestDeals({ products, categories }: {
  products: DealProduct[];
  categories: { id: number; title: string }[];
}) {
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const visibleProducts = products
    .filter((product) => categoryId === null || product.categoryId === categoryId)
    .slice(0, 5);
  if (!products.length) return null;

  return (
    <section className="py-8 sm:py-10">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-medium tracking-[-0.04em] sm:text-3xl">Best deals</h2>
          <span className="rounded-md bg-primary px-3 py-1 text-sm font-bold text-white">Featured</span>
        </div>
        <div className="no-scrollbar flex items-center gap-6 overflow-x-auto pb-1 text-sm sm:text-base">
          <button type="button" onClick={() => setCategoryId(null)} className={`shrink-0 border-b-2 pb-1 ${categoryId === null ? "border-primary text-primary" : "border-transparent text-muted"}`}>All</button>
          {categories.map((category) => (
            <button key={category.id} type="button" onClick={() => setCategoryId(category.id)} className={`shrink-0 border-b-2 pb-1 ${categoryId === category.id ? "border-primary text-primary" : "border-transparent text-muted"}`}>
              {category.title}
            </button>
          ))}
          <Link href={categoryId ? `/deals?category=${categoryId}` : "/deals"} className="shrink-0 font-medium text-primary">View all deals <span aria-hidden="true">→</span></Link>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5 xl:gap-6">
        {visibleProducts.map((product) => <ProductCard key={product.id} {...product} />)}
      </div>
    </section>
  );
}
