"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// 1. Define the available sort options with values your backend can understand
const SortItem = ({ sort }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if this specific sort value is currently active in the URL
  const isSelected = searchParams.get("sort") === sort.value;

  const handleSort = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Set the sort parameter (this overwrites any previous sort)
    params.set("sort", sort.value);

    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <button
      type="button"
      className={`${isSelected ? "text-blue" : "text-body"} group flex items-center justify-between ease-out duration-200 hover:text-blue w-full`}
      onClick={handleSort}
    >
      <div className="flex items-center gap-2">
        <div
          className={`cursor-pointer flex items-center justify-center rounded-full w-4 h-4 border ${isSelected ? "border-blue-dark bg-blue-dark" : "bg-white border-gray-3"
            }`}
        >
          <div className={`w-1.5 h-1.5 rounded-full bg-white ${isSelected ? "block" : "hidden"}`} />
        </div>

        <span className="text-sm">{sort.name}</span>
      </div>
    </button>
  );
};

const SortDropdown = ({ sortOptions }) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);

  return (
    <div className="bg-white shadow-1 rounded-lg">
      <div
        onClick={() => setToggleDropdown(!toggleDropdown)}
        className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 ${toggleDropdown && "shadow-filter"
          }`}
      >
        <p className="text-dark">Sort By</p>
        <button
          type="button"
          aria-label="button for sort dropdown"
          className={`text-dark ease-out duration-200 ${toggleDropdown && "rotate-180"
            }`}
        >
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.43057 8.51192C4.70014 8.19743 5.17361 8.161 5.48811 8.43057L12 14.0122L18.5119 8.43057C18.8264 8.16101 19.2999 8.19743 19.5695 8.51192C19.839 8.82642 19.8026 9.29989 19.4881 9.56946L12.4881 15.5695C12.2072 15.8102 11.7928 15.8102 11.5119 15.5695L4.51192 9.56946C4.19743 9.29989 4.161 8.82641 4.43057 8.51192Z"
            />
          </svg>
        </button>
      </div>

      <div
        className={`flex-col gap-3 py-6 pl-6 pr-5.5 ${toggleDropdown ? "flex" : "hidden"
          }`}
      >
        {sortOptions.map((sort, key) => (
          <SortItem key={key} sort={sort} />
        ))}
      </div>
    </div>
  );
};

export default SortDropdown;