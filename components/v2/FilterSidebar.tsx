"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  children,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white dark:bg-[#1a251d] rounded-xl border border-[#e5e9e6] dark:border-[#2a3a30] shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex justify-between items-center border-b border-[#f0f2f1] dark:border-[#2a3a30] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
      >
        <span className="text-[#1a2b21] dark:text-white font-bold">
          {title}
        </span>
        <span
          className={`material-symbols-outlined text-gray-400 text-sm transition-transform duration-300 ${isOpen ? "" : "rotate-180"}`}
        >
          expand_less
        </span>
      </button>
      <div
        className={`transition-all duration-300 ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"} overflow-auto no-scrollbar`}
      >
        <div className="p-5 flex flex-col gap-3">{children}</div>
      </div>
    </div>
  );
};

interface FilterNode {
  id: number;
  title: string;
  count?: number;
}

interface FilterSidebarProps {
  categories?: FilterNode[];
  brands?: FilterNode[];
  minPrice?: number;
  maxPrice?: number;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories = [],
  brands = [],
  minPrice = 0,
  maxPrice = 1000,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    minPrice,
    maxPrice,
  ]);
  const [sort, setSort] = useState<string>("newest");

  useEffect(() => {
    // Parse URL params
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setSelectedCategories(categoryParam.split(",").map(Number));
    } else {
      setSelectedCategories([]);
    }

    const brandParam = searchParams.get("brand");
    if (brandParam) {
      setSelectedBrands(brandParam.split(",").map(Number));
    } else {
      setSelectedBrands([]);
    }

    const min = searchParams.get("minPrice");
    const max = searchParams.get("maxPrice");
    if (min && max) {
      setPriceRange([Number(min), Number(max)]);
    }

    const sortParam = searchParams.get("sort");
    if (sortParam) {
      setSort(sortParam);
    }
  }, [searchParams]);

  const applyFilters = (
    newCategories?: number[],
    newBrands?: number[],
    newPrice?: [number, number],
    newSort?: string,
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    // Category
    const cats =
      newCategories !== undefined ? newCategories : selectedCategories;
    if (cats.length > 0) {
      params.set("category", cats.join(","));
    } else {
      params.delete("category");
    }

    // Brand
    const brs = newBrands !== undefined ? newBrands : selectedBrands;
    if (brs.length > 0) {
      params.set("brand", brs.join(","));
    } else {
      params.delete("brand");
    }

    // Price
    const price = newPrice !== undefined ? newPrice : priceRange;
    params.set("minPrice", price[0].toString());
    params.set("maxPrice", price[1].toString());

    // Sort
    const s = newSort !== undefined ? newSort : sort;
    params.set("sort", s);

    params.set("page", "1");

    router.push(`/shop?${params.toString()}`);
  };

  const handleCategoryChange = (id: number) => {
    let newCategories;
    if (selectedCategories.includes(id)) {
      newCategories = selectedCategories.filter((c) => c !== id);
    } else {
      newCategories = [...selectedCategories, id];
    }
    setSelectedCategories(newCategories);
    applyFilters(newCategories, undefined, undefined, undefined);
  };

  const handleBrandChange = (id: number) => {
    let newBrands;
    if (selectedBrands.includes(id)) {
      newBrands = selectedBrands.filter((b) => b !== id);
    } else {
      newBrands = [...selectedBrands, id];
    }
    setSelectedBrands(newBrands);
    applyFilters(undefined, newBrands, undefined, undefined);
  };

  const handlePriceChange = (index: 0 | 1, value: number) => {
    const newPrice = [...priceRange] as [number, number];
    newPrice[index] = value;
    setPriceRange(newPrice);
  };

  const handlePriceSliderChange = (value: number) => {
    const newPrice = [priceRange[0], value] as [number, number];
    setPriceRange(newPrice);
  };

  // Only apply price filter when user releases slider or clicks apply
  const handlePriceCommit = () => {
    applyFilters(undefined, undefined, priceRange, undefined);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    applyFilters(undefined, undefined, undefined, value);
  };

  const handleCleanAll = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([minPrice, maxPrice]);
    setSort("newest");
    router.push("/v2/shop");
  };

  return (
    <aside className="w-full lg:w-72 flex flex-col gap-4 shrink-0">
      {/* Active Filters Summary */}
      <div className="bg-white dark:bg-[#1a251d] px-5 py-4 rounded-xl border border-[#e5e9e6] dark:border-[#2a3a30] shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex justify-between items-center transition-colors">
        <h3 className="text-[#1a2b21] dark:text-white text-base font-bold">
          Filters
        </h3>
        <button
          onClick={handleCleanAll}
          className="text-[#648770] hover:text-primary text-sm font-medium transition-colors underline decoration-dotted underline-offset-4"
        >
          Clean All
        </button>
      </div>

      <FilterSection title="Category">
        {categories.map((item) => (
          <label
            key={item.id}
            className="flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <input
                checked={selectedCategories.includes(item.id)}
                onChange={() => handleCategoryChange(item.id)}
                className="rounded border-[#dce5df] text-primary focus:ring-primary h-4 w-4 transition-colors cursor-pointer"
                type="checkbox"
              />
              <span className="text-sm text-[#4a5550] dark:text-[#f6f8f7] group-hover:text-primary transition-colors">
                {item.title}
              </span>
            </div>
            {item.count !== undefined && (
              <span className="text-xs bg-[#f0f4f2] dark:bg-[#1a2e22] text-[#648770] px-2 py-0.5 rounded-full font-bold">
                {item.count}
              </span>
            )}
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Brand">
        {brands.map((item) => (
          <label
            key={item.id}
            className="flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <input
                checked={selectedBrands.includes(item.id)}
                onChange={() => handleBrandChange(item.id)}
                className="rounded border-[#dce5df] text-primary focus:ring-primary h-4 w-4 transition-colors cursor-pointer"
                type="checkbox"
              />
              <span className="text-sm text-[#4a5550] dark:text-[#f6f8f7] group-hover:text-primary transition-colors">
                {item.title}
              </span>
            </div>
            {item.count !== undefined && (
              <span className="text-xs bg-[#f0f4f2] dark:bg-[#1a2e22] text-[#648770] px-2 py-0.5 rounded-full font-bold">
                {item.count}
              </span>
            )}
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Sort By">
        {[
          { name: "Newest Arrivals", value: "newest" },
          { name: "Price: Low to High", value: "price_asc" },
          { name: "Price: High to Low", value: "price_desc" },
          { name: "Oldest", value: "oldest" },
        ].map((item, i) => (
          <label
            key={i}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <input
              checked={sort === item.value}
              onChange={() => handleSortChange(item.value)}
              name="sort"
              className="rounded-full border-[#dce5df] text-primary focus:ring-primary h-4 w-4 cursor-pointer"
              type="radio"
            />
            <span className="text-sm text-[#4a5550] dark:text-[#f6f8f7] group-hover:text-primary">
              {item.name}
            </span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Price Range">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <input
              className="w-full accent-primary h-1.5 bg-[#f0f4f2] dark:bg-[#1a2e22] rounded-lg appearance-none cursor-pointer"
              max={maxPrice}
              min={minPrice}
              type="range"
              value={priceRange[1]}
              onChange={(e) => handlePriceSliderChange(Number(e.target.value))}
              onMouseUp={handlePriceCommit}
              onTouchEnd={handlePriceCommit}
            />
            <div className="flex justify-between items-center text-xs text-[#648770] font-bold">
              <span>${minPrice}</span>
              <span>${maxPrice}+</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#648770] font-bold">
                $
              </span>
              <input
                className="w-full pl-6 pr-2 py-2 text-sm border-[#dce5df] dark:border-[#2a3a30] dark:bg-[#1a2e22] rounded-lg focus:ring-primary focus:border-primary outline-none"
                placeholder="Min"
                type="number"
                value={priceRange[0]}
                onChange={(e) => handlePriceChange(0, Number(e.target.value))}
              />
            </div>
            <span className="text-[#648770]">-</span>
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#648770] font-bold">
                $
              </span>
              <input
                className="w-full pl-6 pr-2 py-2 text-sm border-[#dce5df] dark:border-[#2a3a30] dark:bg-[#1a2e22] rounded-lg focus:ring-primary focus:border-primary outline-none"
                placeholder="Max"
                type="number"
                value={priceRange[1]}
                onChange={(e) => handlePriceChange(1, Number(e.target.value))}
              />
            </div>
          </div>
          <button
            onClick={handlePriceCommit}
            className="w-full bg-primary text-white py-2 rounded-lg font-bold text-sm hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
          >
            Apply Price
          </button>
        </div>
      </FilterSection>

      {/* Promo Card */}
      <div className="mt-2 relative overflow-hidden rounded-2xl bg-primary p-6 text-white shadow-lg transition-transform hover:scale-[1.02] cursor-pointer">
        <div className="relative z-10 flex flex-col gap-3">
          <span className="inline-block w-fit bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
            Green Weekend
          </span>
          <h4 className="text-2xl font-black leading-tight">
            20% Off All Succulents
          </h4>
          <p className="text-xs text-white/80 leading-relaxed font-medium">
            Refresh your home office with nature's air purifiers.
          </p>
          <button className="mt-4 w-full bg-white text-primary py-3 rounded-xl text-sm font-black hover:bg-background-light transition-all active:scale-95 shadow-xl">
            Shop Sale
          </button>
        </div>
        <div className="absolute -right-8 -bottom-8 opacity-20 transform rotate-12">
          <span className="material-symbols-outlined !text-[120px]">
            psychiatry
          </span>
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
