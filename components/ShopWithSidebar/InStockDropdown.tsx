"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const InStockDropdown = ({ inStockCount }) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if stock filter is active in URL
  const isSelected = searchParams.get("stock") === "true";

  const handleFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (isSelected) {
      params.delete("stock");
    } else {
      params.set("stock", "true");
    }
    params.set("page", "1"); // Reset to page 1
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="bg-white shadow-1 rounded-lg">
      <div
        onClick={() => setToggleDropdown(!toggleDropdown)}
        className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 ${toggleDropdown && "shadow-filter"
          }`}
      >
        <p className="text-dark font-medium">Availability</p>
        <button
          className={`text-dark ease-out duration-200 ${toggleDropdown && "rotate-180"}`}
        >
          <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24">
            <path d="M4.43057 8.51192C4.70014 8.19743 5.17361 8.161 5.48811 8.43057L12 14.0122L18.5119 8.43057C18.8264 8.16101 19.2999 8.16101 19.5695 8.51192C19.839 8.82642 19.8026 9.29989 19.4881 9.56946L12.4881 15.5695C12.2072 15.8102 11.7928 15.8102 11.5119 15.5695L4.51192 9.56946C4.19743 9.29989 4.161 8.82641 4.43057 8.51192Z" />
          </svg>
        </button>
      </div>

      <div className={`flex-col gap-3 py-6 pl-6 pr-5.5 ${toggleDropdown ? "flex" : "hidden"}`}>
        <button
          className={`${isSelected ? "text-blue" : "text-dark"} group flex items-center justify-between ease-out duration-200 hover:text-blue`}
          onClick={handleFilter}
        >
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center rounded w-4 h-4 border ${isSelected ? "border-blue bg-blue" : "bg-white border-gray-3"
              }`}
            >
              {isSelected && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M8.33317 2.5L3.74984 7.08333L1.6665 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span>In Stock</span>
          </div>

          <span className={`${isSelected ? "text-white bg-blue-dark" : "bg-gray-2"} inline-flex rounded-[30px] text-custom-xs px-2 ease-out duration-200 group-hover:text-white group-hover:bg-blue-dark`}>
            {inStockCount}
          </span>
        </button>
      </div>
    </div>
  );
};

export default InStockDropdown;