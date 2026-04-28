"use client";

import React, { useState } from "react";
import Link from "next/link";
import ShopHeader from "./ShopHeader";
import ProductCard from "./ProductCard";
import Pagination from "./Pagination";

interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  discountedPrice?: number;
  category: string;
  image: string;
  images?: string[];
  description?: string;
  rating: number;
  reviews: number;
  badge?: { text: string; variant: "primary" | "secondary" };
}

interface ShopContentProps {
  products: Product[];
  totalProducts: number;
  currentPage: number;
  totalPages: number;
}

const ShopContent: React.FC<ShopContentProps> = ({
  products,
  totalProducts,
  currentPage,
  totalPages,
}) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  return (
    <section className="flex-1 flex flex-col gap-6">
      <ShopHeader
        totalProducts={totalProducts}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 gap-6 text-center">
          <div className="size-24 rounded-full bg-[#f1f4f2] dark:bg-[#2a3a2f] flex items-center justify-center text-[#648770]">
            <span className="material-symbols-outlined text-5xl">
              search_off
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#111713] dark:text-white mb-2">
              No Products Found
            </h3>
            <p className="text-[#648770] text-sm">
              Try adjusting your filters or search terms.
            </p>
          </div>
          <Link
            href="/shop"
            className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">
              filter_list_off
            </span>
            Clear All Filters
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} layout="list" />
          ))}
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </section>
  );
};

export default ShopContent;
