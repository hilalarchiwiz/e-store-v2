"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import ShopHeader from "./ShopHeader";
import ProductCard from "./ProductCard";
import type { ShopFilters } from "@/lib/shop-products";
import ShopIntro from "./ShopIntro";
import {
  MobileFilterModal,
  MobileSortModal,
} from "./MobileShopControls";

interface Product {
  id: number;
  slug?: string;
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
  filters: ShopFilters;
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
    slug?: string;
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
  products: initialProducts,
  totalProducts,
  filters,
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

  const [products, setProducts] = useState(initialProducts);
  const [hasMore, setHasMore] = useState(initialProducts.length < totalProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const offset = useRef(initialProducts.length);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => () => activeRequest.current?.abort(), []);

  const loadMore = useCallback(async () => {
    if (activeRequest.current || !hasMore) return;
    const controller = new AbortController();
    activeRequest.current = controller;
    setLoading(true);
    setError(false);
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && key !== "page") params.set(key, value);
    }
    params.set("offset", String(offset.current));
    try {
      const response = await fetch(`/api/shop/products?${params}`, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Unable to load products");
      const data: { products: Product[]; totalProducts: number } = await response.json();
      if (controller.signal.aborted) return;
      offset.current += data.products.length;
      setProducts((previous) => {
        const ids = new Set(previous.map((product) => product.id));
        return [...previous, ...data.products.filter((product) => !ids.has(product.id))];
      });
      setHasMore(data.products.length > 0 && offset.current < data.totalProducts);
    } catch {
      if (!controller.signal.aborted) setError(true);
    } finally {
      if (!controller.signal.aborted) {
        activeRequest.current = null;
        setLoading(false);
      }
    }
  }, [filters, hasMore]);

  useEffect(() => {
    const target = sentinel.current;
    if (!target || !hasMore || error || loading) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void loadMore();
    }, { rootMargin: "200px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, error, loading, loadMore]);

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

      {hasMore && (
        <div ref={sentinel} className="flex min-h-16 items-center justify-center py-4">
          {loading && (
            <div role="status" className="flex items-center gap-3 text-sm text-[#648770]">
              <span aria-hidden="true" className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none" />
              Loading more products…
            </div>
          )}
          {error && (
            <div role="alert" className="flex items-center gap-3 text-sm text-[#648770]">
              Couldn’t load more products.
              <button type="button" onClick={() => void loadMore()} className="font-bold text-primary underline underline-offset-4">
                Try again
              </button>
            </div>
          )}
        </div>
      )}

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
