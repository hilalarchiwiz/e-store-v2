"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";

interface ShopBanner {
  title: string;
  description: string | null;
  buttonText: string | null;
  link: string;
  imageUrl: string;
  bgColor: string;
}

interface ShopCategory {
  id: number;
  title: string;
  image: string;
  count: number;
}

interface ShopIntroProps {
  banner: ShopBanner | null;
  categories: ShopCategory[];
  selectedCategoryIds?: number[];
}

export default function ShopIntro({
  banner,
  categories,
  selectedCategoryIds = [],
}: ShopIntroProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: "left" | "right") => {
    sliderRef.current?.scrollBy({
      left: direction === "left" ? -360 : 360,
      behavior: "smooth",
    });
  };

  const selectCategory = (categoryId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", categoryId.toString());
    params.delete("generation");
    params.set("page", "1");
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-4 sm:gap-5">
      {banner && (
        <section aria-label="Featured shop promotion">
          <Link
            href={banner.link || "/shop"}
            className="group block w-full overflow-hidden rounded-xl border border-[#dfe4e1] bg-[#f2f3f2] shadow-sm dark:border-[#2a3a30] dark:bg-[#18201b]"
            style={{ backgroundColor: banner.bgColor || undefined }}
          >
            {/* Keep the uploaded banner's natural aspect ratio. This supports
                wide, square, or tall admin uploads without cropping them. */}
            <img
              src={banner.imageUrl}
              alt={banner.title}
              className="block max-h-105 w-full object-contain transition-transform duration-500 group-hover:scale-[1.01]"
            />
          </Link>
        </section>
      )}

      {categories.length > 0 && (
        <section
          className="relative w-full min-w-0 max-w-full"
          aria-label="Shop by category"
        >
          <button
            type="button"
            onClick={() => scrollCategories("left")}
            aria-label="Previous categories"
            className="absolute -left-2 top-1/2 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#dfe4e1] bg-white text-[#4f5d54] shadow-md transition-colors hover:border-primary hover:bg-primary hover:text-white sm:flex dark:border-[#2a3a30] dark:bg-[#1a251d] dark:text-white dark:hover:bg-primary"
          >
            <span className="material-symbols-outlined text-xl">
              chevron_left
            </span>
          </button>

          <div
            ref={sliderRef}
            className="flex w-full min-w-0 max-w-full snap-x snap-mandatory gap-3 overflow-x-auto p-0.5 pb-2 no-scrollbar sm:gap-4"
          >
            {categories.map((category) => {
              const isSelected = selectedCategoryIds.includes(category.id);

              return (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => selectCategory(category.id)}
                  aria-current={isSelected ? "page" : undefined}
                  aria-label={`${category.title}, ${category.count} products`}
                  className={`group relative flex h-27 w-34 shrink-0 snap-start flex-col items-center justify-between overflow-hidden rounded-lg border bg-white px-3 pb-2.5 pt-3 shadow-[0_2px_7px_rgba(15,23,42,0.10)] transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md dark:bg-[#1a251d] sm:h-30 sm:w-40 ${
                    isSelected
                      ? "border-primary ring-1 ring-primary/20"
                      : "border-[#dfe4e1] dark:border-[#2a3a30]"
                  }`}
                >
                  <div className="relative min-h-0 w-full flex-1">
                    <Image
                      src={category.image}
                      alt={category.title}
                      fill
                      unoptimized
                      sizes="160px"
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-1 flex max-w-full items-center gap-1.5">
                    <h2 className="truncate text-center text-xs font-semibold text-[#101512] transition-colors group-hover:text-primary dark:text-white sm:text-sm">
                      {category.title}
                    </h2>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => scrollCategories("right")}
            aria-label="Next categories"
            className="absolute -right-2 top-1/2 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#dfe4e1] bg-white text-[#4f5d54] shadow-md transition-colors hover:border-primary hover:bg-primary hover:text-white sm:flex dark:border-[#2a3a30] dark:bg-[#1a251d] dark:text-white dark:hover:bg-primary"
          >
            <span className="material-symbols-outlined text-xl">
              chevron_right
            </span>
          </button>
        </section>
      )}
    </div>
  );
}
