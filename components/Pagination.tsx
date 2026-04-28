"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";

const Pagination = ({ totalPages, currentPage }) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const createPageURL = (pageNumber) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    // Helper to generate page numbers (1, 2, 3 ... 10)
    const getPages = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - 1 && i <= currentPage + 1)
            ) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== "...") {
                pages.push("...");
            }
        }
        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center mt-15">
            <div className="bg-white shadow-1 rounded-md p-2">
                <ul className="flex items-center">
                    {/* Previous Button */}
                    <li>
                        <Link
                            href={createPageURL(currentPage - 1)}
                            className={`flex items-center justify-center w-8 h-9 duration-200 ${currentPage <= 1 ? "pointer-events-none text-gray-4" : "hover:text-blue"
                                }`}
                        >
                            <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18">
                                <path d="M12.1782 16.1156C12.0095 16.1156 11.8407 16.0594 11.7282 15.9187L5.37197 9.45C5.11885 9.19687 5.11885 8.80312 5.37197 8.55L11.7282 2.08125C11.9813 1.82812 12.3751 1.82812 12.6282 2.08125L6.72197 9L12.6563 15.0187C12.9095 15.2719 12.9095 15.6656 12.6563 15.9187Z" />
                            </svg>
                        </Link>
                    </li>

                    {/* Page Numbers */}
                    {getPages().map((page, index) => (
                        <li key={index} className="space-x-3">
                            {page === "..." ? (
                                <span className="px-3.5 py-1.5 text-gray-4">...</span>
                            ) : (
                                <Link
                                    href={createPageURL(page)}
                                    className={`flex py-1.5 px-3.5 space-x-3 duration-200 rounded-[3px] ${currentPage === page
                                        ? "bg-blue text-white"
                                        : "hover:bg-blue hover:text-white"
                                        }`}
                                >
                                    {page}
                                </Link>
                            )}
                        </li>
                    ))}

                    {/* Next Button */}
                    <li>
                        <Link
                            href={createPageURL(currentPage + 1)}
                            className={`flex items-center justify-center w-8 h-9 duration-200 ${currentPage >= totalPages ? "pointer-events-none text-gray-4" : "hover:text-blue"
                                }`}
                        >
                            <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18">
                                <path d="M5.82197 16.1156C5.65322 16.1156 5.5126 16.0594 5.37197 15.9469C5.11885 15.6937 5.11885 15.3 5.37197 15.0469L11.2782 9L5.37197 2.98125C5.11885 2.72812 5.11885 2.33437 5.37197 2.08125C5.6251 1.82812 6.01885 1.82812 6.27197 2.08125L12.6282 8.55C12.8813 8.80312 12.8813 9.19687 12.6282 9.45L6.27197 15.9187C6.15947 16.0312 5.99072 16.1156 5.82197 16.1156Z" />
                            </svg>
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Pagination;