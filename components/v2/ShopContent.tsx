"use client";

import React, { useState } from "react";
import Link from "next/link";
import ShopHeader from "./ShopHeader";
import ProductCard from "./ProductCard";
import Pagination from "./Pagination";
import ShopIntro from "./ShopIntro";
import {
  MobileFilterModal,
  MobileSortModal,
} from "./MobileShopControls";

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
  quantity: number;
  badge?: { text: string; variant: "primary" | "secondary" };
}

interface ShopContentProps {
  products: Product[];
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  banner: {
    title: string;
    description: string | null;
    buttonText: string | null;
    link: string;
    imageUrl: string;
    bgColor: string;
  } | null;
  categories: {
    id: number;
    title: string;
    image: string;
    count: number;
  }[];
  selectedCategoryIds: number[];
  brands: {
    id: number;
    title: string;
    count?: number;
  }[];
  generations: number[];
  minPrice: number;
  maxPrice: number;
}

const ShopContent: React.FC<ShopContentProps> = ({
  products,
  totalProducts,
  currentPage,
  totalPages,
  banner,
  categories,
  selectedCategoryIds,
  brands,
  generations,
  minPrice,
  maxPrice,
}) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);

  return (
    <section
      id="shop-products-section"
      className="flex w-full min-w-0 max-w-full flex-1 flex-col gap-6 scroll-mt-28"
    >
      <ShopHeader
        totalProducts={totalProducts}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenFilters={() => {
          setMobileSortOpen(false);
          setMobileFiltersOpen(true);
        }}
        onOpenSort={() => {
          setMobileFiltersOpen(false);
          setMobileSortOpen(true);
        }}
      />

      <ShopIntro
        banner={banner}
        categories={categories}
        selectedCategoryIds={selectedCategoryIds}
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
        <div className="grid w-full min-w-0 grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
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

      {mobileFiltersOpen && (
        <MobileFilterModal
          onClose={() => setMobileFiltersOpen(false)}
          categories={categories}
          brands={brands}
          generations={generations}
          minPrice={minPrice}
          maxPrice={maxPrice}
        />
      )}
      {mobileSortOpen && (
        <MobileSortModal onClose={() => setMobileSortOpen(false)} />
      )}
    </section>
  );
};

export default ShopContent;
