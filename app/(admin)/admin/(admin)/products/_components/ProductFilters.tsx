"use client";

import { Funnel, RotateCcw } from "lucide-react";
import { FormEvent, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface FilterOption {
  id: number;
  title: string;
}

interface ProductFiltersProps {
  brands: FilterOption[];
  categories: FilterOption[];
  gradings: FilterOption[];
  priceBounds: {
    min: number;
    max: number;
  };
}

const FILTER_KEYS = [
  "brand",
  "category",
  "grading",
  "minPrice",
  "maxPrice",
  "status",
] as const;

const fieldClassName =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

export default function ProductFilters({
  brands,
  categories,
  gradings,
  priceBounds,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const brandParam = searchParams.get("brand") || "";
  const categoryParam = searchParams.get("category") || "";
  const gradingParam = searchParams.get("grading") || "";
  const minPriceParam = searchParams.get("minPrice") || "";
  const maxPriceParam = searchParams.get("maxPrice") || "";
  const statusParam = searchParams.get("status") || "";

  const [brand, setBrand] = useState(brandParam);
  const [category, setCategory] = useState(categoryParam);
  const [grading, setGrading] = useState(gradingParam);
  const [minPrice, setMinPrice] = useState(minPriceParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam);
  const [status, setStatus] = useState(statusParam);
  const [priceError, setPriceError] = useState("");

  const activeFilterCount = FILTER_KEYS.filter((key) =>
    searchParams.has(key),
  ).length;
  const hasDraftFilters = Boolean(
    brand || category || grading || minPrice || maxPrice || status,
  );

  const navigateWithParams = (params: URLSearchParams) => {
    const queryString = params.toString();
    startTransition(() => {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    });
  };

  const setOrDeleteParam = (
    params: URLSearchParams,
    key: string,
    value: string,
  ) => {
    const normalizedValue = value.trim();
    if (normalizedValue) params.set(key, normalizedValue);
    else params.delete(key);
  };

  const handleApply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedMin = minPrice === "" ? undefined : Number(minPrice);
    const parsedMax = maxPrice === "" ? undefined : Number(maxPrice);

    if (
      (parsedMin !== undefined && (!Number.isFinite(parsedMin) || parsedMin < 0)) ||
      (parsedMax !== undefined && (!Number.isFinite(parsedMax) || parsedMax < 0))
    ) {
      setPriceError("Prices must be valid numbers greater than or equal to zero.");
      return;
    }

    if (
      parsedMin !== undefined &&
      parsedMax !== undefined &&
      parsedMin > parsedMax
    ) {
      setPriceError("Minimum price cannot be greater than maximum price.");
      return;
    }

    setPriceError("");
    const params = new URLSearchParams(searchParams.toString());
    setOrDeleteParam(params, "brand", brand);
    setOrDeleteParam(params, "category", category);
    setOrDeleteParam(params, "grading", grading);
    setOrDeleteParam(params, "minPrice", minPrice);
    setOrDeleteParam(params, "maxPrice", maxPrice);
    setOrDeleteParam(params, "status", status);
    params.set("page", "1");
    navigateWithParams(params);
  };

  const handleReset = () => {
    const params = new URLSearchParams(searchParams.toString());
    FILTER_KEYS.forEach((key) => params.delete(key));
    params.set("page", "1");

    setBrand("");
    setCategory("");
    setGrading("");
    setMinPrice("");
    setMaxPrice("");
    setStatus("");
    setPriceError("");
    navigateWithParams(params);
  };

  return (
    <form
      onSubmit={handleApply}
      className="border-b border-gray-200 bg-gray-50/60 px-6 py-5"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Funnel className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-gray-800">Filter products</h2>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
              {activeFilterCount} active
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleReset}
          disabled={(!hasDraftFilters && activeFilterCount === 0) || isPending}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 transition hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Clear filters
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <label className="space-y-1.5 text-xs font-medium text-gray-600">
          Brand
          <select
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
            className={fieldClassName}
          >
            <option value="">All brands</option>
            <option value="none">No brand</option>
            {brands.map((option) => (
              <option key={option.id} value={option.id}>
                {option.title}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5 text-xs font-medium text-gray-600">
          Category
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={fieldClassName}
          >
            <option value="">All categories</option>
            <option value="none">Uncategorized</option>
            {categories.map((option) => (
              <option key={option.id} value={option.id}>
                {option.title}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5 text-xs font-medium text-gray-600">
          Grading
          <select
            value={grading}
            onChange={(event) => setGrading(event.target.value)}
            className={fieldClassName}
          >
            <option value="">All gradings</option>
            <option value="none">Ungraded</option>
            {gradings.map((option) => (
              <option key={option.id} value={option.id}>
                {option.title}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5 text-xs font-medium text-gray-600">
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className={fieldClassName}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
        </label>

        <label className="space-y-1.5 text-xs font-medium text-gray-600">
          Minimum price
          <input
            type="number"
            min="0"
            step="0.01"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            placeholder={`From ${priceBounds.min}`}
            className={fieldClassName}
          />
        </label>

        <label className="space-y-1.5 text-xs font-medium text-gray-600">
          Maximum price
          <input
            type="number"
            min="0"
            step="0.01"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            placeholder={`Up to ${priceBounds.max}`}
            className={fieldClassName}
          />
        </label>
      </div>

      <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="min-h-5 text-sm text-red-600" role="alert">
          {priceError}
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-w-32 items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60"
        >
          {isPending ? "Applying..." : "Apply filters"}
        </button>
      </div>
    </form>
  );
}
