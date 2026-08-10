// components/global/SearchInput.tsx
'use client';

import { Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface SearchInputProps {
    placeholder?: string;
    queryKey?: string; // Allows searching by 'name', 'title', or 'search'
}

const SearchInput: React.FC<SearchInputProps> = ({
    placeholder = "Search...",
    queryKey = "search"
}) => {
    const { replace } = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Sync state with URL (important if user hits 'back' button)
    const [searchTerm, setSearchTerm] = useState(searchParams.get(queryKey) || "");

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', '1');

        if (term) {
            params.set(queryKey, term);
        } else {
            params.delete(queryKey);
        }

        replace(`${pathname}?${params.toString()}`);
    }, 500);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);
        handleSearch(term);
    };

    return (
        <div className="relative w-full">
            <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
    );
};

export default SearchInput;