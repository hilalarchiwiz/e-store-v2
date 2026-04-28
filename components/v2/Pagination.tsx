"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages }) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/v2/shop?${params.toString()}`);
  };

  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [1];
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const btnBase =
    "size-10 rounded-xl flex items-center justify-center font-bold transition-all active:scale-95";

  return (
    <div className="flex justify-center items-center gap-2 mt-8 py-10">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${btnBase} border border-[#dce5df] dark:border-[#2a3a30] text-[#648770] hover:bg-primary hover:text-white hover:border-primary group disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <span className="material-symbols-outlined transition-transform group-hover:-translate-x-0.5">
          chevron_left
        </span>
      </button>

      {getPageNumbers().map((page, idx) =>
        page === "..." ? (
          <span
            key={`ellipsis-${idx}`}
            className="text-[#648770] font-bold select-none px-1"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => goToPage(page as number)}
            className={`${btnBase} ${
              page === currentPage
                ? "bg-primary text-white shadow-lg shadow-primary/30"
                : "border border-[#dce5df] dark:border-[#2a3a30] text-[#111713] dark:text-white hover:bg-primary/5 hover:border-primary"
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${btnBase} border border-[#dce5df] dark:border-[#2a3a30] text-[#648770] hover:bg-primary hover:text-white hover:border-primary group disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <span className="material-symbols-outlined transition-transform group-hover:translate-x-0.5">
          chevron_right
        </span>
      </button>
    </div>
  );
};

export default Pagination;
