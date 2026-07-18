"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  LoaderCircle,
  PackageCheck,
  Search,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useDebouncedCallback } from "use-debounce";
import {
  searchErpProductsByTitle,
  updateProductTitleAndQuantity,
} from "../(actions)/product-list.action";

export interface QuickEditProduct {
  id: number;
  title: string;
  quantity: number;
}

interface ProductTitleMatch {
  id: string;
  uniqueId: string | null;
  title: string;
  status: string | null;
  category: string | null;
  warehouseLocation: string | null;
  disposition: string | null;
  workflowStage: string | null;
  sold: boolean;
  scrapped: boolean;
  manualProduct: boolean;
  units: number;
}

interface ProductQuickEditModalProps {
  product: QuickEditProduct;
  onClose: () => void;
}

const getWordCount = (value: string) =>
  value.match(/[\p{L}\p{N}]+/gu)?.length ?? 0;

export default function ProductQuickEditModal({
  product,
  onClose,
}: ProductQuickEditModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState(product.title);
  const [quantity, setQuantity] = useState(String(product.quantity));
  const [validationError, setValidationError] = useState("");
  const [matches, setMatches] = useState<ProductTitleMatch[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [searchMessage, setSearchMessage] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isQuantityFromErp, setIsQuantityFromErp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchRequestId = useRef(0);
  const wordCount = getWordCount(title);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isSubmitting, onClose]);

  const runTitleSearch = useDebouncedCallback(
    async (searchTitle: string, requestId: number) => {
      try {
        const result = await searchErpProductsByTitle(searchTitle);
        if (requestId !== searchRequestId.current) return;

        if (!result.success) {
          setMatches([]);
          setIsQuantityFromErp(false);
          setSearchMessage(result.message || "Unable to search ERP products.");
          return;
        }

        setMatches(result.products as ProductTitleMatch[]);
        setQuantity(String(result.availableQuantity));
        setIsQuantityFromErp(true);
        setSearchMessage("");
      } catch {
        if (requestId !== searchRequestId.current) return;
        setMatches([]);
        setIsQuantityFromErp(false);
        setSearchMessage("ERP search is unavailable. Please try again.");
      } finally {
        if (requestId === searchRequestId.current) setIsSearching(false);
      }
    },
    600,
  );

  useEffect(
    () => () => {
      searchRequestId.current += 1;
      runTitleSearch.cancel();
    },
    [runTitleSearch],
  );

  const scheduleTitleSearch = useCallback((searchTitle: string, immediate = false) => {
    runTitleSearch.cancel();
    searchRequestId.current += 1;
    const requestId = searchRequestId.current;
    const nextWordCount = getWordCount(searchTitle);

    if (nextWordCount < 3) {
      setIsSearching(false);
      setHasSearched(false);
      setMatches([]);
      setIsQuantityFromErp(false);
      setSearchMessage("");
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    setMatches([]);
    setIsQuantityFromErp(false);
    setSearchMessage("");
    runTitleSearch(searchTitle, requestId);
    if (immediate) runTitleSearch.flush();
  }, [runTitleSearch]);

  useEffect(() => {
    scheduleTitleSearch(product.title, true);
  }, [product.title, scheduleTitleSearch]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setSelectedMatchId(null);
    setValidationError("");
    scheduleTitleSearch(value);
  };

  const handleSelectMatch = (match: ProductTitleMatch) => {
    searchRequestId.current += 1;
    runTitleSearch.cancel();
    setIsSearching(false);
    setSelectedMatchId(match.id);
    setTitle(match.title);
    setValidationError("");
    scheduleTitleSearch(match.title, true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedTitle = title.trim();
    const parsedQuantity = Number(quantity);

    if (normalizedTitle.length < 5) {
      setValidationError("Title must contain at least 5 characters.");
      return;
    }

    if (normalizedTitle.length > 200) {
      setValidationError("Title cannot exceed 200 characters.");
      return;
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      setValidationError(
        "Quantity must be a whole number greater than or equal to zero.",
      );
      return;
    }

    setValidationError("");
    setIsSubmitting(true);

    try {
      const result = await updateProductTitleAndQuantity(
        product.id,
        normalizedTitle,
        parsedQuantity,
      );

      if (!result.success) {
        setValidationError(result.message || "Unable to update the product.");
        return;
      }

      toast.success(result.message);
      onClose();
      router.refresh();
    } catch {
      setValidationError("Unable to update the product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-edit-product-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        <div className="flex shrink-0 items-start justify-between border-b px-6 py-4">
          <div className="flex gap-3">
            <span className="mt-0.5 rounded-lg bg-amber-100 p-2 text-amber-700">
              <PackageCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2
                id="quick-edit-product-title"
                className="text-lg font-semibold text-gray-900"
              >
                Match and update product
              </h2>
              <p className="mt-0.5 text-sm text-gray-500">
                Search the ERP title, select a match, then adjust the values if needed.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close quick edit modal"
            className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="space-y-5 p-6">
            <div>
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="quick-edit-title"
                  className="text-sm font-medium text-gray-700"
                >
                  Product title
                </label>
                <span className="text-xs text-gray-400">
                  {wordCount}/3 search words · {title.length}/200 characters
                </span>
              </div>
              <div className="relative">
                <input
                  id="quick-edit-title"
                  type="text"
                  value={title}
                  onChange={(event) => handleTitleChange(event.target.value)}
                  minLength={5}
                  maxLength={200}
                  autoFocus
                  required
                  disabled={isSubmitting}
                  aria-describedby="erp-title-search-help"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-12 text-sm text-gray-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:bg-gray-100"
                />
                <button
                  type="button"
                  onClick={() => scheduleTitleSearch(title, true)}
                  disabled={wordCount < 3 || isSearching || isSubmitting}
                  aria-label="Search ERP products by title"
                  title="Search ERP products"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-2 text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:text-gray-300"
                >
                  {isSearching ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Search className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              <p id="erp-title-search-help" className="mt-1.5 text-xs text-gray-500">
                {wordCount < 3
                  ? `Enter ${3 - wordCount} more ${3 - wordCount === 1 ? "word" : "words"} to search ERP products.`
                  : "ERP search runs automatically after you stop typing."}
              </p>
            </div>

            {(isSearching || hasSearched) && (
              <section
                aria-label="ERP product title matches"
                className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
              >
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2.5">
                  <h3 className="text-sm font-semibold text-gray-700">ERP matches</h3>
                  {!isSearching && !searchMessage && (
                    <span className="text-xs text-gray-500">
                      {matches.length} {matches.length === 1 ? "result" : "results"}
                    </span>
                  )}
                </div>

                {isSearching ? (
                  <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-gray-500">
                    <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Searching ERP products...
                  </div>
                ) : searchMessage ? (
                  <div className="px-4 py-6 text-center text-sm text-red-600">
                    {searchMessage}
                  </div>
                ) : matches.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">
                    No ERP products matched this product name and configuration.
                  </div>
                ) : (
                  <div className="max-h-64 space-y-2 overflow-y-auto p-2">
                    {matches.map((match) => {
                      const isSelected = selectedMatchId === match.id;
                      const metadata = [
                        match.uniqueId ? `ID: ${match.uniqueId}` : null,
                        match.category,
                        match.warehouseLocation,
                        match.disposition,
                        match.workflowStage,
                      ].filter(Boolean);

                      return (
                        <button
                          key={`${match.id}-${match.uniqueId ?? match.title}`}
                          type="button"
                          onClick={() => handleSelectMatch(match)}
                          className={`w-full rounded-lg border p-3 text-left transition ${
                            isSelected
                              ? "border-amber-500 bg-amber-50 ring-1 ring-amber-500/20"
                              : "border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/40"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-start gap-2">
                                {isSelected && (
                                  <Check
                                    className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
                                    aria-hidden="true"
                                  />
                                )}
                                <span className="text-sm font-semibold text-gray-900">
                                  {match.title}
                                </span>
                              </div>
                              {metadata.length > 0 && (
                                <p className="mt-1 text-xs text-gray-500">
                                  {metadata.join(" · ")}
                                </p>
                              )}
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {match.status && (
                                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-600">
                                    {match.status}
                                  </span>
                                )}
                                {match.manualProduct && (
                                  <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[11px] font-medium text-blue-700">
                                    Manual product
                                  </span>
                                )}
                                {match.sold && (
                                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700">
                                    Sold
                                  </span>
                                )}
                                {match.scrapped && (
                                  <span className="rounded bg-red-100 px-1.5 py-0.5 text-[11px] font-medium text-red-700">
                                    Scrapped
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                              Qty {match.units}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            <div>
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="quick-edit-quantity"
                  className="text-sm font-medium text-gray-700"
                >
                  Available quantity
                </label>
                {isQuantityFromErp && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    Filled from available ERP matches
                  </span>
                )}
              </div>
              <input
                id="quick-edit-quantity"
                type="number"
                value={quantity}
                onChange={(event) => {
                  setQuantity(event.target.value);
                  setIsQuantityFromErp(false);
                  setValidationError("");
                }}
                min="0"
                step="1"
                inputMode="numeric"
                required
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:bg-gray-100"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                ERP quantity updates after each successful title search. You can change it before saving.
              </p>
            </div>

            <p className="min-h-5 text-sm text-red-600" role="alert">
              {validationError}
            </p>
          </div>

          <div className="flex shrink-0 flex-col-reverse gap-3 border-t bg-white px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-w-36 items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting && (
                <LoaderCircle
                  className="h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              {isSubmitting ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
