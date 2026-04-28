"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";

interface SubCat {
  id: number;
  title: string;
  _count?: { products: number };
}

interface Cat {
  id: number;
  title: string;
  name?: string;
  subCategories?: SubCat[];
  _count?: { products: number };
}

const SubCategoryItem = ({ subCategory, categoryId }: { subCategory: SubCat; categoryId: number }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isSelected = searchParams.get("subcategory") === String(subCategory.id);

  const handleFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (isSelected) {
      params.delete("subcategory");
    } else {
      params.set("category", String(categoryId));
      params.set("subcategory", String(subCategory.id));
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <button
      type="button"
      className={`${isSelected ? "text-blue" : "text-body"} group flex items-center justify-between ease-out duration-200 hover:text-blue w-full pl-4`}
      onClick={handleFilter}
    >
      <div className="flex items-center gap-2">
        <ChevronRight size={12} className="text-gray-400 shrink-0" />
        <div
          className={`cursor-pointer flex items-center justify-center rounded w-3.5 h-3.5 border ${
            isSelected ? "border-blue bg-blue" : "bg-white border-gray-3"
          }`}
        >
          <svg className={isSelected ? "block" : "hidden"} width="8" height="8" viewBox="0 0 10 10" fill="none">
            <path d="M8.33317 2.5L3.74984 7.08333L1.6665 5" stroke="white" strokeWidth="1.94437" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-sm">{subCategory.title}</span>
      </div>
      <span
        className={`${isSelected ? "text-white bg-blue-dark" : "bg-gray-2 text-dark"} inline-flex rounded-[30px] text-custom-xs px-2 ease-out duration-200 group-hover:text-white group-hover:bg-blue-dark`}
      >
        {subCategory._count?.products || 0}
      </span>
    </button>
  );
};

const CategoryItem = ({ category }: { category: Cat }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isSelected = searchParams.get("category") === String(category.id);
  const hasSubCategories = (category.subCategories?.length ?? 0) > 0;
  const [subOpen, setSubOpen] = useState(isSelected);

  const handleFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (isSelected) {
      params.delete("category");
      params.delete("subcategory");
    } else {
      params.set("category", String(category.id));
      params.delete("subcategory");
    }
    router.push(`?${params.toString()}`, { scroll: false });
    if (!isSelected) setSubOpen(true);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className={`${isSelected ? "text-blue" : "text-body"} group flex items-center gap-2 ease-out duration-200 hover:text-blue flex-1`}
          onClick={handleFilter}
        >
          <div
            className={`cursor-pointer flex items-center justify-center rounded w-4 h-4 border ${
              isSelected ? "border-blue bg-blue" : "bg-white border-gray-3"
            }`}
          >
            <svg className={isSelected ? "block" : "hidden"} width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M8.33317 2.5L3.74984 7.08333L1.6665 5" stroke="white" strokeWidth="1.94437" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span>{category.name || category.title}</span>
        </button>

        <div className="flex items-center gap-2">
          <span
            className={`${isSelected ? "text-white bg-blue-dark" : "bg-gray-2 text-dark"} inline-flex rounded-[30px] text-custom-xs px-2 ease-out duration-200`}
          >
            {category._count?.products || 0}
          </span>
          {hasSubCategories && (
            <button
              type="button"
              onClick={() => setSubOpen(!subOpen)}
              className="text-gray-400 hover:text-blue transition-transform duration-200"
              style={{ transform: subOpen ? "rotate(90deg)" : "rotate(0deg)" }}
            >
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>

      {hasSubCategories && subOpen && (
        <div className="flex flex-col gap-2 mt-1 border-l border-gray-200 ml-2">
          {category.subCategories?.map((sub) => (
            <SubCategoryItem key={sub.id} subCategory={sub} categoryId={category.id} />
          ))}
        </div>
      )}
    </div>
  );
};

const CategoryDropdown = ({ categories }) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);

  return (
    <div className="bg-white shadow-1 rounded-lg">
      <div
        onClick={() => setToggleDropdown(!toggleDropdown)}
        className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 ${toggleDropdown && "shadow-filter"}`}
      >
        <p className="text-dark">Category</p>
        <button
          type="button"
          aria-label="button for category dropdown"
          className={`text-dark ease-out duration-200 ${toggleDropdown && "rotate-180"}`}
        >
          <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.43057 8.51192C4.70014 8.19743 5.17361 8.161 5.48811 8.43057L12 14.0122L18.5119 8.43057C18.8264 8.16101 19.2999 8.19743 19.5695 8.51192C19.839 8.82642 19.8026 9.29989 19.4881 9.56946L12.4881 15.5695C12.2072 15.8102 11.7928 15.8102 11.5119 15.5695L4.51192 9.56946C4.19743 9.29989 4.161 8.82641 4.43057 8.51192Z"
              fill=""
            />
          </svg>
        </button>
      </div>
      <div className={`flex-col gap-3 py-6 pl-6 pr-5.5 max-h-72 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${toggleDropdown ? "flex" : "hidden"}`}>
        {categories?.map((category, key) => (
          <CategoryItem key={category.id || key} category={category} />
        ))}
      </div>
    </div>
  );
};

export default CategoryDropdown;
