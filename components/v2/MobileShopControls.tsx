"use client";

import { useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface FilterOption {
  id: number;
  title: string;
  count?: number;
}

interface MobileFilterModalProps {
  onClose: () => void;
  categories: FilterOption[];
  brands: FilterOption[];
  generations: number[];
  minPrice: number;
  maxPrice: number;
}

interface MobileSortModalProps {
  onClose: () => void;
}

const parseNumberList = (value: string | null) =>
  value
    ? Array.from(
        new Set(
          value
            .split(",")
            .map(Number)
            .filter((item) => Number.isFinite(item)),
        ),
      )
    : [];

const ordinal = (value: number) => {
  if (value % 100 >= 11 && value % 100 <= 13) return `${value}th`;
  if (value % 10 === 1) return `${value}st`;
  if (value % 10 === 2) return `${value}nd`;
  if (value % 10 === 3) return `${value}rd`;
  return `${value}th`;
};

function useModalBehavior(onClose: () => void) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);
}

export function MobileFilterModal({
  onClose,
  categories,
  brands,
  generations,
  minPrice,
  maxPrice,
}: MobileFilterModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCategories, setSelectedCategories] = useState<number[]>(() =>
    parseNumberList(searchParams.get("category")),
  );
  const [selectedBrands, setSelectedBrands] = useState<number[]>(() =>
    parseNumberList(searchParams.get("brand")),
  );
  const [selectedGenerations, setSelectedGenerations] = useState<number[]>(() =>
    parseNumberList(searchParams.get("generation")),
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get("minPrice")) || minPrice,
    Number(searchParams.get("maxPrice")) || maxPrice,
  ]);

  useModalBehavior(onClose);

  const toggleValue = (
    value: number,
    selected: number[],
    setSelected: Dispatch<SetStateAction<number[]>>,
  ) => {
    setSelected(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    );
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    ["category", "brand", "generation", "minPrice", "maxPrice"].forEach(
      (key) => params.delete(key),
    );
    params.set("page", "1");

    router.push(`/shop?${params.toString()}`, { scroll: false });
    onClose();
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    const setList = (key: string, values: number[]) => {
      if (values.length > 0) params.set(key, values.join(","));
      else params.delete(key);
    };

    const previousCategories = parseNumberList(searchParams.get("category"));
    const categoriesChanged =
      previousCategories.join(",") !== selectedCategories.join(",");

    setList("category", selectedCategories);
    setList("brand", selectedBrands);

    if (generations.length > 0 && !categoriesChanged) {
      setList("generation", selectedGenerations);
    } else {
      params.delete("generation");
    }

    if (priceRange[0] === minPrice && priceRange[1] === maxPrice) {
      params.delete("minPrice");
      params.delete("maxPrice");
    } else {
      params.set("minPrice", priceRange[0].toString());
      params.set("maxPrice", priceRange[1].toString());
    }
    params.set("page", "1");

    router.push(`/shop?${params.toString()}`, { scroll: false });
    onClose();
  };

  const chipClass = (selected: boolean) =>
    `inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
      selected
        ? "bg-primary text-white shadow-sm"
        : "bg-[#f0f3f1] text-[#27332c] hover:bg-primary/10 dark:bg-white/10 dark:text-white"
    }`;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-5 lg:hidden"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-filter-title"
        className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-[#f7f9f8] shadow-2xl dark:bg-[#111a14] sm:max-w-lg sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-black/5 bg-white px-5 py-4 dark:border-white/10 dark:bg-[#1a251d]">
          <div>
            <p className="text-xs font-semibold text-primary">Refine your search</p>
            <h2
              id="mobile-filter-title"
              className="mt-0.5 text-xl font-black text-[#111713] dark:text-white"
            >
              Filters
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="flex size-10 items-center justify-center rounded-full bg-[#f0f3f1] text-[#526058] transition-colors hover:bg-red-50 hover:text-red-500 dark:bg-white/10 dark:text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">
          <FilterCard title="Category">
            <button
              type="button"
              onClick={() => setSelectedCategories([])}
              className={chipClass(selectedCategories.length === 0)}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                type="button"
                key={category.id}
                onClick={() =>
                  toggleValue(
                    category.id,
                    selectedCategories,
                    setSelectedCategories,
                  )
                }
                className={chipClass(selectedCategories.includes(category.id))}
              >
                {category.title}
                {category.count !== undefined && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                      selectedCategories.includes(category.id)
                        ? "bg-white/20"
                        : "bg-white dark:bg-black/20"
                    }`}
                  >
                    {category.count}
                  </span>
                )}
              </button>
            ))}
          </FilterCard>

          {generations.length > 0 && (
            <FilterCard title="Generation">
              {generations.map((generation) => (
                <button
                  type="button"
                  key={generation}
                  onClick={() =>
                    toggleValue(
                      generation,
                      selectedGenerations,
                      setSelectedGenerations,
                    )
                  }
                  className={chipClass(
                    selectedGenerations.includes(generation),
                  )}
                >
                  {ordinal(generation)} Gen
                </button>
              ))}
            </FilterCard>
          )}

          <FilterCard title="Brands">
            <button
              type="button"
              onClick={() => setSelectedBrands([])}
              className={chipClass(selectedBrands.length === 0)}
            >
              All
            </button>
            {brands.map((brand) => (
              <button
                type="button"
                key={brand.id}
                onClick={() =>
                  toggleValue(brand.id, selectedBrands, setSelectedBrands)
                }
                className={chipClass(selectedBrands.includes(brand.id))}
              >
                {brand.title}
                {brand.count !== undefined && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                      selectedBrands.includes(brand.id)
                        ? "bg-white/20"
                        : "bg-white dark:bg-black/20"
                    }`}
                  >
                    {brand.count}
                  </span>
                )}
              </button>
            ))}
          </FilterCard>

          <div className="rounded-2xl border border-[#dce4df] bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1a251d]">
            <h3 className="text-base font-black text-[#111713] dark:text-white">
              Price Range
            </h3>
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              step={Math.max(1, Math.round(maxPrice / 100))}
              value={priceRange[1]}
              onChange={(event) =>
                setPriceRange([priceRange[0], Number(event.target.value)])
              }
              className="mt-4 h-1.5 w-full cursor-pointer accent-primary"
            />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-[#617067]">
                Minimum
                <input
                  type="number"
                  min={minPrice}
                  max={priceRange[1]}
                  value={priceRange[0]}
                  onChange={(event) =>
                    setPriceRange([
                      Math.min(Number(event.target.value), priceRange[1]),
                      priceRange[1],
                    ])
                  }
                  className="mt-1.5 w-full rounded-xl border border-[#dce4df] bg-[#f7f9f8] px-3 py-2.5 text-sm font-bold text-[#111713] outline-none focus:border-primary dark:border-white/10 dark:bg-black/20 dark:text-white"
                />
              </label>
              <label className="text-xs font-semibold text-[#617067]">
                Maximum
                <input
                  type="number"
                  min={priceRange[0]}
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={(event) =>
                    setPriceRange([
                      priceRange[0],
                      Math.max(Number(event.target.value), priceRange[0]),
                    ])
                  }
                  className="mt-1.5 w-full rounded-xl border border-[#dce4df] bg-[#f7f9f8] px-3 py-2.5 text-sm font-bold text-[#111713] outline-none focus:border-primary dark:border-white/10 dark:bg-black/20 dark:text-white"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-black/5 bg-white p-4 dark:border-white/10 dark:bg-[#1a251d]">
          <button
            type="button"
            onClick={clearFilters}
            className="min-h-12 rounded-xl border border-[#dce4df] bg-white text-sm font-bold text-primary shadow-sm transition-colors hover:bg-primary/5 dark:border-white/10 dark:bg-transparent"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={applyFilters}
            className="min-h-12 rounded-xl bg-primary text-sm font-bold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary-dark"
          >
            Apply Filters
          </button>
        </div>
      </section>
    </div>
  );
}

function FilterCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#dce4df] bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1a251d]">
      <h3 className="mb-3 text-base font-black text-[#111713] dark:text-white">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function MobileSortModal({ onClose }: MobileSortModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedSort = searchParams.get("sort") || "newest";

  useModalBehavior(onClose);

  const options = [
    { label: "Newest Arrivals", value: "newest" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
    { label: "Oldest", value: "oldest" },
  ];

  const selectSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.set("page", "1");
    router.push(`/shop?${params.toString()}`, { scroll: false });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px] lg:hidden"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-sort-title"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-[#dce4df] bg-white p-3 shadow-2xl dark:border-white/10 dark:bg-[#1a251d]"
      >
        <div className="flex items-center justify-between px-2 pb-2 pt-1">
          <h2
            id="mobile-sort-title"
            className="text-lg font-black text-[#111713] dark:text-white"
          >
            Sort Products
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sorting"
            className="flex size-9 items-center justify-center rounded-full bg-[#f0f3f1] text-[#526058] dark:bg-white/10 dark:text-white"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {options.map((option) => {
          const selected = selectedSort === option.value;
          return (
            <button
              type="button"
              key={option.value}
              onClick={() => selectSort(option.value)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-left text-sm font-semibold transition-colors ${
                selected
                  ? "bg-primary/10 text-primary"
                  : "text-[#202a24] hover:bg-[#f4f7f5] dark:text-white dark:hover:bg-white/5"
              }`}
            >
              <span
                className={`flex size-5 items-center justify-center rounded-full border-2 ${
                  selected ? "border-primary" : "border-[#6e7a72]"
                }`}
              >
                {selected && <span className="size-2.5 rounded-full bg-primary" />}
              </span>
              {option.label}
            </button>
          );
        })}
      </section>
    </div>
  );
}
