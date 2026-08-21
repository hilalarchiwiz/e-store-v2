"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface ShopHeaderProps {
  totalProducts: number;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onOpenFilters: () => void;
  onOpenSort: () => void;
}

const ShopHeader: React.FC<ShopHeaderProps> = ({
  totalProducts,
  viewMode,
  onViewModeChange,
  onOpenFilters,
  onOpenSort,
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchParam = searchParams.get("search") || "";
  const [searchDraft, setSearchDraft] = useState({
    source: searchParam,
    value: searchParam,
  });
  const search =
    searchDraft.source === searchParam ? searchDraft.value : searchParam;
  const activeFilterCount = ["category", "brand", "generation"].filter(
    (key) => Boolean(searchParams.get(key)),
  ).length +
    (searchParams.get("minPrice") || searchParams.get("maxPrice") ? 1 : 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search.trim()) {
      params.set("search", search.trim());
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  const clearSearch = () => {
    setSearchDraft({ source: searchParam, value: "" });
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.set("page", "1");
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col items-stretch gap-3 rounded-2xl border border-[#dce5df] bg-white p-3 shadow-sm transition-colors dark:border-[#2a3a30] dark:bg-[#1a251d] sm:p-4 lg:flex-row lg:items-center">
      <div className="flex flex-col gap-3 min-[430px]:flex-row min-[430px]:items-center min-[430px]:justify-between lg:hidden">
        <div className="flex items-baseline gap-2 whitespace-nowrap px-0.5">
          <span className="text-2xl font-black leading-none text-[#111713] dark:text-white">
            {totalProducts}
          </span>
          <span className="text-sm font-medium text-[#648770]">
            Products Found
          </span>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 min-[430px]:w-auto">
          <button
            type="button"
            onClick={onOpenFilters}
            className="relative flex h-11 min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-[#dce5df] bg-white px-3 text-sm font-bold text-[#111713] shadow-sm transition-colors hover:border-primary hover:text-primary dark:border-[#2a3a30] dark:bg-[#142019] dark:text-white min-[430px]:min-w-28"
          >
            <span className="material-symbols-outlined text-[19px] text-primary">
              tune
            </span>
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full border-2 border-white bg-primary text-[9px] text-white dark:border-[#142019]">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={onOpenSort}
            className="flex h-11 min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-[#dce5df] bg-white px-3 text-sm font-bold text-[#111713] shadow-sm transition-colors hover:border-primary hover:text-primary dark:border-[#2a3a30] dark:bg-[#142019] dark:text-white min-[430px]:min-w-28"
          >
            Sort By
            <span className="material-symbols-outlined text-[19px] text-primary">
              swap_vert
            </span>
          </button>
        </div>
      </div>

      {/* Search */}
      <form
        onSubmit={handleSearch}
        className="flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-transparent bg-[#f1f4f2] px-3.5 py-2.5 transition-colors focus-within:border-primary/30 dark:bg-[#111c14]"
      >
        <span className="material-symbols-outlined text-[#648770] text-xl shrink-0">
          search
        </span>
        <input
          value={search}
          onChange={(e) =>
            setSearchDraft({ source: searchParam, value: e.target.value })
          }
          placeholder="Search products..."
          className="flex-1 bg-transparent outline-none text-sm text-[#111713] dark:text-white placeholder:text-[#648770] min-w-0"
        />
        {search && (
          <button
            type="button"
            onClick={clearSearch}
            className="text-[#648770] hover:text-primary transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        )}
      </form>

      {/* Right: count + view toggle */}
      <div className="hidden items-center gap-4 shrink-0 lg:flex">
        <div className="flex items-center gap-1.5 pl-1">
          <span className="text-[#111713] dark:text-white text-base font-black">
            {totalProducts}
          </span>
          <span className="text-[#648770] text-sm font-medium">
            product {totalProducts !== 1 ? "s" : ""} found
          </span>
        </div>

        <div className="flex border border-[#dce5df] dark:border-[#2a3a30] rounded-xl overflow-hidden">
          <button
            onClick={() => onViewModeChange("grid")}
            title="Grid view"
            className={`p-2.5 border-r border-[#dce5df] dark:border-[#2a3a30] transition-colors ${
              viewMode === "grid"
                ? "bg-primary/10 text-primary"
                : "text-[#648770] hover:bg-[#f0f4f2] dark:hover:bg-[#1a2e22]"
            }`}
          >
            <span className="material-symbols-outlined text-xl">grid_view</span>
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            title="List view"
            className={`p-2.5 transition-colors ${
              viewMode === "list"
                ? "bg-primary/10 text-primary"
                : "text-[#648770] hover:bg-[#f0f4f2] dark:hover:bg-[#1a2e22]"
            }`}
          >
            <span className="material-symbols-outlined text-xl">view_list</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopHeader;
