'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface PaginationProps {
    totalPages: number;
    currentPage: number;
    search: string;
}

const Pagination: React.FC<PaginationProps> = ({ totalPages, currentPage, search }) => {
    const pathname = usePathname();

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams();
        if (search) {
            params.set('search', search);
        }
        params.set('page', pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    const renderPageNumbers = () => {
        const pages = [];
        // Simple logic: show current page, 2 pages before and 2 pages after
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <Link
                    key={i}
                    href={createPageURL(i)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${i === currentPage
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    {i}
                </Link>
            );
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-center space-x-2">
            {/* Previous Button */}
            <Link
                href={currentPage > 1 ? createPageURL(currentPage - 1) : '#'}
                className={`p-2 rounded-lg transition-colors ${currentPage > 1
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'text-gray-400 cursor-not-allowed'
                    }`}
                aria-disabled={currentPage <= 1}
            >
                <ChevronLeft className="w-5 h-5" />
            </Link>

            {/* Page Numbers */}
            {renderPageNumbers()}

            {/* Next Button */}
            <Link
                href={currentPage < totalPages ? createPageURL(currentPage + 1) : '#'}
                className={`p-2 rounded-lg transition-colors ${currentPage < totalPages
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'text-gray-400 cursor-not-allowed'
                    }`}
                aria-disabled={currentPage >= totalPages}
            >
                <ChevronRight className="w-5 h-5" />
            </Link>
        </div>
    );
};

export default Pagination;