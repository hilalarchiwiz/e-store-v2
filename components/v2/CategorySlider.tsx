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
      href={`/v2/shop?category=${encodeURIComponent(cat.name)}`}
      className="flex flex-col items-center w-36 lg:w-48 shrink-0 group gap-4 cursor-pointer"
    >
      <div className="relative w-36 h-36 lg:w-48 lg:h-48 rounded-full bg-[#1b211d] dark:bg-[#1a201c] border border-gray-200 dark:border-white/5 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] dark:shadow-none group-hover:bg-gray-100 dark:group-hover:bg-[#252d28] group-hover:scale-[1.03] transition-all duration-300 flex items-center justify-center overflow-hidden">
        {/* Image */}
        {!imgError && (
          <div className="absolute inset-0 p-4">
             <div className="relative w-full h-full rounded-full overflow-hidden">
                 <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 1024px) 144px, 192px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={() => setImgError(true)}
                />
             </div>
          </div>
        )}

        {/* Fallback Icon */}
        {imgError && (
          <span className="material-symbols-outlined text-4xl text-gray-400 dark:text-white/20">
            category
          </span>
        )}
      </div>

      <div className="text-center px-1">
        <h3 className="text-gray-900 dark:text-[#f8faf9] text-sm lg:text-base font-medium leading-snug group-hover:text-primary transition-colors">
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
    <section className="px-6 py-12">
      {/* Header */}
      <div className="flex justify-between items-end mb-10 max-w-7xl mx-auto">
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
      <div className="relative max-w-7xl mx-auto">
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
