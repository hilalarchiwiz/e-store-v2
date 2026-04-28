'use client';

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface PaginationProps {
    totalPages: number | undefined;
}

const Pagination = ({ totalPages }: PaginationProps) => {
    const { replace } = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentPage = Number(searchParams.get('page')) || 1;

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    const handlePageChange = (page: number) => {
        if (!totalPages || page < 1 || page > totalPages) return;
        replace(createPageURL(page));
    };

    const renderPageNumbers = () => {
        if (!totalPages) return null;

        const pages = [];
        const itemsToShow = 2; // Number of pages to show around current page

        for (let i = 1; i <= totalPages; i++) {
            // Always show first page, last page, and pages around current page
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - itemsToShow && i <= currentPage + itemsToShow)
            ) {
                pages.push(
                    <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`px-3 cursor-pointer py-1.5 rounded-md text-sm font-medium transition-colors ${currentPage === i
                                ? 'bg-emerald-600 text-white'
                                : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {i}
                    </button>
                );
            }
            // Add dots if there is a gap
            else if (
                i === currentPage - itemsToShow - 1 ||
                i === currentPage + itemsToShow + 1
            ) {
                pages.push(
                    <span key={i} className="px-2 text-gray-400">
                        <MoreHorizontal size={16} />
                    </span>
                );
            }
        }
        return pages;
    };

    if (!totalPages || totalPages <= 1) return null;

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-1.5 cursor-pointer rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-1">
                {renderPageNumbers()}
            </div>

            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-md cursor-pointer border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
};

export default Pagination;