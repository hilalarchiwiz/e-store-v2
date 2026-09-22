"use client";

import SiteIcon from '@/components/v2/SiteIcon';
import ShopBenefits from "./ShopBenefits";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  children,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-surface dark:bg-surface rounded-xl border border-outline dark:border-outline shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex justify-between items-center border-b border-[#f0f2f1] dark:border-outline hover:bg-surface dark:hover:bg-white/5 transition-colors"
      >
        <span className="text-foreground dark:text-foreground font-bold">
          {title}
        </span>
        <SiteIcon
          className={`text-muted text-sm transition-transform duration-300 ${isOpen ? "" : "rotate-180"}`}
        >
          expand_less
        </SiteIcon>
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
  slug?: string;
  title: string;
  count?: number;
}

interface FilterSidebarProps {
  categories?: FilterNode[];
  brands?: FilterNode[];
  generations?: number[];
  minPrice?: number;
  maxPrice?: number;
}

const FilterSidebarContent: React.FC<FilterSidebarProps> = ({
  categories = [],
  brands = [],
  generations = [],
  minPrice = 0,
  maxPrice = 1000,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isApplying, setIsApplying] = useState(false);

  const categoryParamStr = searchParams.get("category") || "";
  const brandParamStr = searchParams.get("brand") || "";
  const minParamStr = searchParams.get("minPrice") || "";
  const maxParamStr = searchParams.get("maxPrice") || "";
  const sortParamStr = searchParams.get("sort") || "";
  const generationParamStr = searchParams.get("generation") || "";

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryParamStr ? categoryParamStr.split(",") : []
  );
  const [selectedBrands, setSelectedBrands] = useState<number[]>(
    brandParamStr ? brandParamStr.split(",").map(Number) : []
  );
  const [priceRange, setPriceRange] = useState<[number, number]>(
    minParamStr && maxParamStr ? [Number(minParamStr), Number(maxParamStr)] : [minPrice, maxPrice]
  );
  const [sort, setSort] = useState<string>(sortParamStr || "newest");
  const [selectedGenerations, setSelectedGenerations] = useState<number[]>(
    generationParamStr
      ? Array.from(new Set(generationParamStr.split(",").map(Number)))
      : [],
  );

  const scrollToProducts = () => {
    const el = document.getElementById("shop-products-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const applyFilters = (
    newCategories?: string[],
    newBrands?: number[],
    newPrice?: [number, number],
    newSort?: string,
    newGenerations?: number[],
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

    // Preserve an existing price filter unless the price controls changed.
    if (newPrice !== undefined) {
      if (newPrice[0] === minPrice && newPrice[1] === maxPrice) {
        params.delete("minPrice");
        params.delete("maxPrice");
      } else {
        params.set("minPrice", newPrice[0].toString());
        params.set("maxPrice", newPrice[1].toString());
      }
    }

    // Sort
    const s = newSort !== undefined ? newSort : sort;
    params.set("sort", s);

    // Generation (available only for the Laptop category)
    const gens =
      newGenerations !== undefined
        ? newGenerations
        : selectedGenerations;
    if (gens.length > 0) {
      params.set("generation", Array.from(new Set(gens)).join(","));
    } else {
      params.delete("generation");
    }

    params.set("page", "1");

    if (params.toString() === searchParams.toString()) return;
    setIsApplying(true);
    router.push(`/shop?${params.toString()}`, { scroll: false });
    scrollToProducts();
  };

  const handleCategoryChange = (key: string) => {
    let newCategories;
    if (selectedCategories.includes(key)) {
      newCategories = selectedCategories.filter((c) => c !== key);
    } else {
      newCategories = [...selectedCategories, key];
    }
    setSelectedCategories(newCategories);
    setSelectedGenerations([]);
    applyFilters(newCategories, undefined, undefined, undefined, []);
  };

  const handleGenerationChange = (generation: number) => {
    const newGenerations = selectedGenerations.includes(generation)
      ? selectedGenerations.filter((item) => item !== generation)
      : [...selectedGenerations, generation];

    setSelectedGenerations(newGenerations);
    applyFilters(
      undefined,
      undefined,
      undefined,
      undefined,
      newGenerations,
    );
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
    if (!Number.isFinite(value)) return;

    if (index === 0) {
      setPriceRange([
        Math.min(Math.max(value, minPrice), priceRange[1]),
        priceRange[1],
      ]);
      return;
    }

    setPriceRange([
      priceRange[0],
      Math.max(Math.min(value, maxPrice), priceRange[0]),
    ]);
  };

  const handlePriceSliderChange = (value: number) => {
    setPriceRange([Math.min(priceRange[0], value), value]);
  };

  // Apply the selected price range when the slider is released or the button is clicked.
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
    setSelectedGenerations([]);
    setPriceRange([minPrice, maxPrice]);
    setSort("newest");
    if (!searchParams.toString()) return;
    setIsApplying(true);
    router.push("/shop", { scroll: false });
  };

  return (
    <aside
      aria-busy={isApplying}
      className={`hidden w-full min-w-0 max-w-full shrink-0 flex-col gap-4 lg:flex lg:w-72 ${isApplying ? "pointer-events-none opacity-70" : ""}`}
    >
      {isApplying && (
        <div
          role="status"
          className="pointer-events-none fixed left-1/2 top-24 z-[70] flex -translate-x-1/2 items-center gap-3 rounded-full border border-outline bg-surface px-5 py-3 text-sm font-bold text-foreground shadow-xl dark:border-white/10 dark:bg-surface dark:text-white"
        >
          <span className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Updating products…
        </div>
      )}
      {/* Active Filters Summary */}
      <div className="bg-surface dark:bg-surface px-5 py-4 rounded-xl border border-outline dark:border-outline shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex justify-between items-center transition-colors">
        <h3 className="text-foreground dark:text-foreground text-base font-bold">
          Filters
        </h3>
        <button
          onClick={handleCleanAll}
          className="text-muted hover:text-primary text-sm font-medium transition-colors underline decoration-dotted underline-offset-4"
        >
          Clean All
        </button>
      </div>

      <FilterSection title="Category">
        {categories.map((item) => {
          const key = item.slug || item.id.toString();
          return (
            <label
              key={item.id}
              className="flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <input
                  checked={selectedCategories.includes(key)}
                  onChange={() => handleCategoryChange(key)}
                  className="rounded border-outline text-primary focus:ring-primary h-4 w-4 transition-colors cursor-pointer"
                  type="checkbox"
                />
                <span className="text-sm text-muted dark:text-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </span>
              </div>
              {item.count !== undefined && (
                <span className="text-xs bg-surface dark:bg-surface text-muted px-2 py-0.5 rounded-full font-bold">
                  {item.count}
                </span>
              )}
            </label>
          );
        })}
      </FilterSection>

      {generations.length > 0 && (
        <FilterSection
          title="Generation"
          defaultOpen={selectedGenerations.length > 0}
        >
          {generations.map((generation) => (
            <label
              key={generation}
              className="group flex cursor-pointer items-center gap-3"
            >
              <input
                checked={selectedGenerations.includes(generation)}
                onChange={() => handleGenerationChange(generation)}
                className="h-4 w-4 cursor-pointer rounded border-outline text-primary transition-colors focus:ring-primary"
                type="checkbox"
              />
              <span className="text-sm text-muted transition-colors group-hover:text-primary dark:text-foreground">
                {generation}
                {generation % 100 >= 11 && generation % 100 <= 13
                  ? "th"
                  : generation % 10 === 1
                    ? "st"
                    : generation % 10 === 2
                      ? "nd"
                      : generation % 10 === 3
                        ? "rd"
                        : "th"}{" "}
                Generation
              </span>
            </label>
          ))}
        </FilterSection>
      )}

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
                className="rounded border-outline text-primary focus:ring-primary h-4 w-4 transition-colors cursor-pointer"
                type="checkbox"
              />
              <span className="text-sm text-muted dark:text-foreground group-hover:text-primary transition-colors">
                {item.title}
              </span>
            </div>
            {item.count !== undefined && (
              <span className="text-xs bg-surface dark:bg-surface text-muted px-2 py-0.5 rounded-full font-bold">
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
              className="rounded-full border-outline text-primary focus:ring-primary h-4 w-4 cursor-pointer"
              type="radio"
            />
            <span className="text-sm text-muted dark:text-foreground group-hover:text-primary">
              {item.name}
            </span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Price Range">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <input
              aria-label="Maximum price range"
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-outline accent-primary dark:bg-white/20"
              max={maxPrice}
              min={minPrice}
              step={1}
              type="range"
              value={priceRange[1]}
              onChange={(e) => handlePriceSliderChange(Number(e.target.value))}
              onMouseUp={handlePriceCommit}
              onTouchEnd={handlePriceCommit}
            />
            <div className="flex items-center justify-between text-xs font-bold text-muted">
              <span>Rs. {minPrice}</span>
              <span>Rs. {maxPrice}+</span>
            </div>
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
            <label className="min-w-0 text-xs font-semibold text-muted">
              Minimum
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-muted">
                  Rs
                </span>
                <input
                  aria-label="Minimum price"
                  className="w-full appearance-none rounded-lg border border-outline bg-surface py-2 pl-7 pr-2 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-outline dark:bg-surface dark:text-foreground [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  min={minPrice}
                  max={priceRange[1]}
                  step={1}
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) =>
                    handlePriceChange(0, Number(e.target.value))
                  }
                />
              </div>
            </label>
            <span className="pb-2.5 text-muted" aria-hidden="true">–</span>
            <label className="min-w-0 text-xs font-semibold text-muted">
              Maximum
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-muted">
                  Rs
                </span>
                <input
                  aria-label="Maximum price"
                  className="w-full appearance-none rounded-lg border border-outline bg-surface py-2 pl-7 pr-2 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-outline dark:bg-surface dark:text-foreground [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  min={priceRange[0]}
                  max={maxPrice}
                  step={1}
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) =>
                    handlePriceChange(1, Number(e.target.value))
                  }
                />
              </div>
            </label>
          </div>
          <button
            type="button"
            onClick={handlePriceCommit}
            className="w-full bg-primary text-white py-2 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <SiteIcon  style={{ fontSize: "16px" }}>filter_alt</SiteIcon>
            Filter Price
          </button>
        </div>
      </FilterSection>

      {/* Promo Card */}
      <div className="mt-2 relative overflow-hidden rounded-2xl bg-primary p-6 text-white shadow-lg transition-transform hover:scale-[1.02] cursor-pointer">
        <div className="relative z-10 flex flex-col gap-3">
          <span className="inline-block w-fit bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
            Green Weekend
          </span>
          <h4 className="text-2xl font-medium leading-tight">
            Power Up Your Setup
          </h4>
          <p className="text-xs text-white/80 leading-relaxed font-medium">
            Save upto 20% on laptops and pc components
          </p>
          <button className="mt-4 w-full bg-white text-primary py-3 rounded-xl text-sm font-medium hover:bg-background-light transition-all active:scale-95 shadow-xl">
            Shop Sale
          </button>
        </div>
      </div>
      <ShopBenefits />

    </aside>
  );
};

const FilterSidebar: React.FC<FilterSidebarProps> = (props) => {
  const searchParams = useSearchParams();

  return (
    <FilterSidebarContent
      key={`${searchParams.toString()}-${props.minPrice}-${props.maxPrice}`}
      {...props}
    />
  );
};

export default FilterSidebar;
