"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface ShopHeaderProps {
  totalProducts: number;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

const ShopHeader: React.FC<ShopHeaderProps> = ({
  totalProducts,
  viewMode,
  onViewModeChange,
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search.trim()) {
      params.set("search", search.trim());
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`/shop?${params.toString()}`);
  };

  const clearSearch = () => {
    setSearch("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.set("page", "1");
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white dark:bg-[#1a251d] p-4 rounded-2xl border border-[#dce5df] dark:border-[#2a3a30] shadow-sm transition-colors">
      {/* Search */}
      <form
        onSubmit={handleSearch}
        className="flex-1 flex items-center gap-2 bg-[#f1f4f2] dark:bg-[#111c14] rounded-xl px-4 py-2.5 border border-transparent focus-within:border-primary/30 transition-colors"
      >
        <span className="material-symbols-outlined text-[#648770] text-xl shrink-0">
          search
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-1.5 pl-1">
          <span className="text-[#111713] dark:text-white text-base font-black">
            {totalProducts}
          </span>
          <span className="text-[#648770] text-sm font-medium">
            product{totalProducts !== 1 ? "s" : ""} found
          </span>
        </div>

        <div className="flex border border-[#dce5df] dark:border-[#2a3a30] rounded-xl overflow-hidden">
          <button
            onClick={() => onViewModeChange("grid")}
            title="Grid view"
            className={`p-2.5 border-r border-[#dce5df] dark:border-[#2a3a30] transition-colors ${viewMode === "grid"
              ? "bg-primary/10 text-primary"
              : "text-[#648770] hover:bg-[#f0f4f2] dark:hover:bg-[#1a2e22]"
              }`}
          >
            <span className="material-symbols-outlined text-xl">grid_view</span>
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            title="List view"
            className={`p-2.5 transition-colors ${viewMode === "list"
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
