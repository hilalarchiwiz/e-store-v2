'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export default function TableControls() {
    const { replace } = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // 1. Handle "Show entries" dropdown
    const handleLimitChange = (limit: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('limit', limit);
        params.set('page', '1'); // Reset to page 1 when limit changes
        replace(`${pathname}?${params.toString()}`);
    };

    // 2. Handle Search input with debounce
    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('search', term);
        } else {
            params.delete('search');
        }
        params.set('page', '1'); // Reset to page 1 when searching
        replace(`${pathname}?${params.toString()}`);
    }, 400);

    return (
        <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-b border-gray-200 gap-4">
            {/* Limit Selector */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Show</span>
                <select
                    defaultValue={searchParams.get('limit') || '10'}
                    onChange={(e) => handleLimitChange(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer"
                >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>
                <span>entries</span>
            </div>

            {/* Dynamic Search */}
            <div className="flex items-center gap-2 text-sm text-gray-600 w-full sm:w-auto">
                <span>Search:</span>
                <input
                    type="text"
                    placeholder="Type to search..."
                    defaultValue={searchParams.get('search')?.toString()}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-48 transition-all"
                />
            </div>
        </div>
    );
}