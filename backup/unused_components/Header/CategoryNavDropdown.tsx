"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface SubCategory {
  id: number;
  title: string;
}

interface Category {
  id: number;
  title: string;
  subCategories?: SubCategory[];
}

interface CategoryNavDropdownProps {
  categories: Category[];
  stickyMenu: boolean;
}

const CategoryNavDropdown = ({ categories, stickyMenu }: CategoryNavDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const [subPanelTop, setSubPanelTop] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      setHoveredCategory(null);
    }, 150);
  };

  const handleCatEnter = (e: React.MouseEvent<HTMLLIElement>, catId: number) => {
    const li = e.currentTarget;
    const ul = listRef.current;
    if (ul) {
      // offset from top of the ul, accounting for scroll
      setSubPanelTop(li.offsetTop - ul.scrollTop);
    }
    setHoveredCategory(catId);
  };

  const hoveredCat = categories?.find((c) => c.id === hoveredCategory);
  const hasSubCats = (hoveredCat?.subCategories?.length ?? 0) > 0;

  return (
    <li
      className="group relative before:w-0 before:h-[3px] before:bg-blue before:absolute before:left-0 before:top-0 before:rounded-b-[3px] before:ease-out before:duration-200 hover:before:w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={`hover:text-blue text-[15px] font-medium text-dark flex items-center gap-1 ${
          stickyMenu ? "xl:py-4" : "xl:py-6"
        }`}
      >
        Categories
        <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M2.95363 5.67461C3.13334 5.46495 3.44899 5.44067 3.65866 5.62038L7.99993 9.34147L12.3412 5.62038C12.5509 5.44067 12.8665 5.46495 13.0462 5.67461C13.2259 5.88428 13.2017 6.19993 12.992 6.37964L8.32532 10.3796C8.13808 10.5401 7.86178 10.5401 7.67453 10.3796L3.00787 6.37964C2.7982 6.19993 2.77392 5.88428 2.95363 5.67461Z"
            fill=""
          />
        </svg>
      </button>

      {open && (
        // Wrapper — positioning context for the subcategory panel, NO overflow set
        <div className="absolute left-0 top-full z-50 w-55">

          {/* Category list — scrolls independently, clips only vertically */}
          <ul
            ref={listRef}
            className="w-full bg-white shadow-lg border border-gray-100 rounded-b-md py-2 max-h-72 overflow-y-auto overflow-x-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {categories?.map((cat) => (
              <li
                key={cat.id}
                onMouseEnter={(e) => handleCatEnter(e, cat.id)}
              >
                <Link
                  href={`/shop?category=${cat.id}`}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between px-4 py-2.5 text-[14px] transition-colors ${
                    hoveredCategory === cat.id
                      ? "text-blue bg-blue/5"
                      : "text-dark hover:text-blue hover:bg-gray-50"
                  }`}
                >
                  <span>{cat.title}</span>
                  {(cat.subCategories?.length ?? 0) > 0 && (
                    <ChevronRight
                      size={14}
                      className={hoveredCategory === cat.id ? "text-blue" : "text-gray-400"}
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* Subcategory panel — absolute from wrapper, y-position tracks hovered item */}
          {hasSubCats && hoveredCat && (
            <ul
              className="absolute left-full bg-white shadow-lg border border-gray-100 rounded-md py-2 min-w-max z-50"
              style={{ top: subPanelTop, marginLeft: 4 }}
            >
              {hoveredCat.subCategories!.map((sub) => (
                <li key={sub.id}>
                  <Link
                    href={`/shop?category=${hoveredCat.id}&subcategory=${sub.id}`}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2.5 text-[14px] text-dark hover:text-blue hover:bg-gray-50 transition-colors whitespace-nowrap"
                  >
                    {sub.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}

        </div>
      )}
    </li>
  );
};

export default CategoryNavDropdown;
