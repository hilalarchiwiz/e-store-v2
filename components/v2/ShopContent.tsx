"use client";


import SiteIcon from '@/components/v2/SiteIcon';
import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ShopHeader from "./ShopHeader";
import ProductCard from "./ProductCard";
import type { ShopFilters } from "@/lib/shop-products";
import { listingPage, SHOP_PAGE_SIZE, visibleListingPage } from "@/lib/listing-pagination";
import ShopIntro from "./ShopIntro";
import ShopBenefits from "./ShopBenefits";
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

interface ActiveFilter {
  key: string;
  label: string;
  remove: (params: URLSearchParams) => void;
}

function ActiveShopFilters({
  categories,
  brands,
}: Pick<ShopContentProps, "categories" | "brands">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isUpdating, setIsUpdating] = useState(false);
  const filters: ActiveFilter[] = [];

  const addListFilters = (
    key: "category" | "brand" | "generation",
    getLabel: (value: string) => string,
  ) => {
    const values = (searchParams.get(key) || "").split(",").filter(Boolean);
    values.forEach((value) => {
      filters.push({
        key: `${key}-${value}`,
        label: getLabel(value),
        remove: (params) => {
          const remaining = values.filter((item) => item !== value);
          if (remaining.length) params.set(key, remaining.join(","));
          else params.delete(key);
        },
      });
    });
  };

  addListFilters("category", (value) => {
    const category = categories.find(
      (item) => item.slug === value || String(item.id) === value,
    );
    return `Category: ${category?.title || value}`;
  });
  addListFilters("brand", (value) => {
    const brand = brands.find((item) => String(item.id) === value);
    return `Brand: ${brand?.title || value}`;
  });
  addListFilters("generation", (value) => `Generation: ${value}`);

  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  if (minPrice || maxPrice) {
    filters.push({
      key: "price",
      label: `Price: Rs. ${minPrice || "0"} – Rs. ${maxPrice || "Any"}`,
      remove: (params) => {
        params.delete("minPrice");
        params.delete("maxPrice");
      },
    });
  }

  const search = searchParams.get("search");
  if (search) {
    filters.push({
      key: "search",
      label: `Search: ${search}`,
      remove: (params) => params.delete("search"),
    });
  }

  const sort = searchParams.get("sort");
  if (sort && sort !== "newest") {
    const sortLabels: Record<string, string> = {
      price_asc: "Price: Low to High",
      price_desc: "Price: High to Low",
      oldest: "Oldest",
    };
    filters.push({
      key: "sort",
      label: `Sort: ${sortLabels[sort] || sort}`,
      remove: (params) => params.delete("sort"),
    });
  }

  if (!filters.length) return null;

  const navigate = (params: URLSearchParams) => {
    params.set("page", "1");
    setIsUpdating(true);
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  return (
    <div
      aria-busy={isUpdating}
      className="relative flex flex-wrap items-center gap-2 rounded-xl border border-outline bg-surface p-3 shadow-sm dark:border-outline dark:bg-surface"
    >
      <span className="mr-1 text-xs font-bold text-muted">Applied filters:</span>
      {filters.map((filter) => (
        <button
          key={filter.key}
          type="button"
          disabled={isUpdating}
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            filter.remove(params);
            navigate(params);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-2.5 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-white disabled:cursor-wait disabled:opacity-60"
          aria-label={`Remove ${filter.label} filter`}
        >
          {filter.label}
          <SiteIcon className="text-[12px]">close</SiteIcon>
        </button>
      ))}
      <button
        type="button"
        disabled={isUpdating}
        onClick={() => {
          setIsUpdating(true);
          router.push("/shop", { scroll: false });
        }}
        className="ml-auto px-2 py-1 text-xs font-bold text-muted underline underline-offset-4 transition-colors hover:text-primary disabled:cursor-wait"
      >
        Clear All
      </button>
      {isUpdating && (
        <span className="ml-1 size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-label="Updating products" />
      )}
    </div>
  );
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
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  const initialPage = listingPage(filters.page);
  const [products, setProducts] = useState(() =>
    initialProducts.map((product) => ({ ...product, loadedPage: initialPage })),
  );
  const initialOffset = (listingPage(filters.page) - 1) * SHOP_PAGE_SIZE + initialProducts.length;
  const [hasMore, setHasMore] = useState(initialOffset < totalProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const offset = useRef(initialOffset);
  const currentPage = useRef(listingPage(filters.page));
  const productList = useRef<HTMLDivElement>(null);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => () => activeRequest.current?.abort(), []);

  useEffect(() => {
    const updateScrollButton = () => setShowScrollToTop(window.scrollY > 400);
    updateScrollButton();
    window.addEventListener("scroll", updateScrollButton, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollButton);
  }, []);

  useEffect(() => {
    const list = productList.current;
    if (!list) return;
    let frame: number | null = null;
    const updatePage = () => {
      frame = null;
      const boundaries = Array.from(list.querySelectorAll<HTMLElement>("[data-listing-page]"))
        .map((element) => ({
          page: Number(element.dataset.listingPage),
          top: element.getBoundingClientRect().top,
        }));
      const page = visibleListingPage(boundaries, window.innerHeight * 0.4, initialPage);
      if (page === currentPage.current) return;
      currentPage.current = page;
      const url = new URL(window.location.href);
      url.searchParams.set("page", String(page));
      // Preserve appended products and scroll position; do not navigate.
      window.history.replaceState(window.history.state, "", url);
    };
    const scheduleUpdate = () => {
      if (frame === null) frame = window.requestAnimationFrame(updatePage);
    };
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(list);
    scheduleUpdate();
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      observer.disconnect();
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [initialPage, products, viewMode]);

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
      const loadedPage = Math.floor(offset.current / SHOP_PAGE_SIZE) + 1;
      offset.current += data.products.length;
      setProducts((previous) => {
        const ids = new Set(previous.map((product) => product.id));
        return [...previous, ...data.products
          .filter((product) => !ids.has(product.id))
          .map((product) => ({ ...product, loadedPage }))];
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

      <ActiveShopFilters categories={categories} brands={brands} />

      <ShopIntro
        banner={banner}
        categories={categories}
        selectedCategoryIds={selectedCategoryIds}
      />

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 gap-6 text-center">
          <div className="size-24 rounded-full bg-icon-surface dark:bg-icon-surface flex items-center justify-center text-muted">
            <SiteIcon className="text-5xl">
              search_off
            </SiteIcon>
          </div>
          <div>
            <h3 className="text-2xl font-medium text-foreground dark:text-foreground mb-2">
              No Products Found
            </h3>
            <p className="text-muted text-sm">
              Try adjusting your filters or search terms.
            </p>
          </div>
          <Link
            href="/shop"
            className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <SiteIcon className="text-sm">
              filter_list_off
            </SiteIcon>
            Clear All Filters
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        <div ref={productList} className="grid w-full min-w-0 grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              {...product}
              listingPage={index === 0 || products[index - 1].loadedPage !== product.loadedPage
                ? product.loadedPage : undefined}
            />
          ))}
        </div>
      ) : (
        <div ref={productList} className="flex flex-col gap-4">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              {...product}
              layout="list"
              listingPage={index === 0 || products[index - 1].loadedPage !== product.loadedPage
                ? product.loadedPage : undefined}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div ref={sentinel} className="flex min-h-16 items-center justify-center py-4">
          {loading && (
            <div role="status" className="flex items-center gap-3 text-sm text-muted">
              <span aria-hidden="true" className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none" />
              Loading more products…
            </div>
          )}
          {error && (
            <div role="alert" className="flex items-center gap-3 text-sm text-muted">
              Couldn’t load more products.
              <button type="button" onClick={() => void loadMore()} className="font-bold text-primary underline underline-offset-4">
                Try again
              </button>
            </div>
          )}
        </div>
      )}

      <div className="lg:hidden">
        <ShopBenefits />
      </div>

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

      <button
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed right-4 bottom-4 z-40 flex size-11 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all duration-200 hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transition-none sm:right-6 sm:bottom-6 ${
          showScrollToTop
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <SiteIcon aria-hidden="true" >
          keyboard_arrow_up
        </SiteIcon>
      </button>
    </section>
  );
};

export default ShopContent;
