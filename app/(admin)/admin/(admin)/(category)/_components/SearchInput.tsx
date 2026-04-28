// app/admin/category/_components/SearchInput.tsx

'use client';

import { Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useDebouncedCallback } from 'use-debounce'; // You'll need to install this: npm install use-debounce

interface SearchInputProps {
    initialSearch: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ initialSearch }) => {
    const { replace } = useRouter();
    const pathname = usePathname();
    const [searchTerm, setSearchTerm] = useState(initialSearch);

    // Debounce the function to limit database queries
    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(window.location.search);
        params.set('page', '1'); // Reset to page 1 on new search

        if (term) {
            params.set('search', term);
        } else {
            params.delete('search');
        }

        // Update the URL without reloading the whole page (Next.js client-side navigation)
        replace(`${pathname}?${params.toString()}`);
    }, 500); // Wait 500ms after the user stops typing

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);
        handleSearch(term);
    };

    return (
        <>
            <input
                type="text"
                placeholder="Search categories by title or description..."
                value={searchTerm}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </>
    );
};

export default SearchInput;