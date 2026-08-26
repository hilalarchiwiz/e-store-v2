"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Category {
  name: string;
  count: number;
  image: string;
}

interface CategorySliderProps {
  categories: Category[];
}

function CategoryCard({ cat }: { cat: Category }) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={`/shop?category=${encodeURIComponent(cat.name)}`}
      className="group relative flex h-27 w-34 sm:h-30 sm:w-40 lg:h-36 lg:w-48 shrink-0 snap-start flex-col items-center justify-between overflow-hidden rounded-lg border border-[#dfe4e1] bg-white px-3 pb-2.5 pt-3 shadow-[0_2px_7px_rgba(15,23,42,0.10)] transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md dark:border-[#2a3a30] dark:bg-[#1a251d]"
    >
      <div className="relative min-h-0 w-full flex-1">
        {!imgError ? (
          <Image
            src={cat.image}
            alt={cat.name}
            fill
            unoptimized
            sizes="160px"
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-gray-400 dark:text-white/20">
              category
            </span>
          </div>
        )}
      </div>
      <div className="mt-1 flex max-w-full items-center gap-1.5">
        <h3 className="truncate text-center text-xs lg:text-sm font-semibold text-[#101512] transition-colors group-hover:text-primary dark:text-white">
          {cat.name}
        </h3>
      </div>
    </Link>
  );
}

const CategorySlider: React.FC<CategorySliderProps> = ({ categories = [] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth > 768 ? 400 : 250;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-12">
      {/* Header */}
      <div className="flex justify-between items-end mb-10 ">
        <div>
          <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">
            Shop By Category
          </p>
          <h2 className="text-3xl font-black tracking-tight text-[#121714] dark:text-white">
            Browse Categories
          </h2>
          <div className="w-12 h-0.75 bg-primary rounded-full mt-3" />
        </div>

        {/* Navigation Buttons */}
        <div className="hidden sm:flex gap-2">
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="size-10 rounded-full border border-gray-300 dark:border-[#2a3a2f] dark:bg-[#151a17] flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white dark:hover:bg-primary dark:hover:border-primary dark:text-white transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[20px]">
              chevron_left
            </span>
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="size-10 rounded-full border border-gray-300 dark:border-[#2a3a2f] dark:bg-[#151a17] flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white dark:hover:bg-primary dark:hover:border-primary dark:text-white transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[20px]">
              chevron_right
            </span>
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="relative  mx-auto">
        <div
          ref={scrollRef}
          className="flex gap-6 sm:gap-10 overflow-x-auto no-scrollbar scroll-smooth pb-4 snap-x snap-mandatory py-2"
        >
          {categories.map((cat, idx) => (
            <div key={idx} className="snap-start shrink-0">
              <CategoryCard cat={cat} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySlider;
