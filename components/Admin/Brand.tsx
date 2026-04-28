'use client';

import Select, { components } from 'react-select';
import { getBrandsBySearch } from "@/app/(admin)/admin/(admin)/products/(actions)/product.action"
import { useState, useCallback, useRef, useEffect } from 'react';
import { Brand } from '@/types/brand';

const PAGE_SIZE = 50;

interface SelectOption {
    value: string;
    label: string;
}

const mapBrandsToOptions = (brands: Brand[]): SelectOption[] => {
    return brands.map((brand) => ({
        value: brand.id.toString(),
        label: brand.title,
    }));
};

const CustomMenuList = (props: any) => {
    const { options, children, getValue, selectProps } = props;
    const { handleScroll } = selectProps;

    const scrollRef = useRef(null);

    const onScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        if (scrollHeight - scrollTop <= clientHeight + 1) {
            handleScroll();
        }
    };

    return (
        <components.MenuList {...props}>
            <div
                ref={scrollRef}
                onScroll={onScroll}
                style={{ maxHeight: '300px', overflowY: 'auto' }}
            >
                {children}
                {selectProps.hasMore && (
                    <div className="p-2 text-center text-gray-500">Loading more brands...</div>
                )}
            </div>
        </components.MenuList>
    );
};


const OptimizedGetAllBrands = ({ selectValue, selectId, setFormData }: {
    selectValue?: string | undefined, // This is the brand Title (e.g., "Apple")
    selectId?: string | undefined,    // <--- ADD THIS PROP (The brand ID)
    setFormData: (value: any) => void | null, // This is the function to set the formData
}) => {
    // 💡 NEW: State to track if the component has mounted on the client
    const [isMounted, setIsMounted] = useState(false);

    // Existing states
    const [selectedValue, setSelectedValue] = useState<SelectOption | null | undefined>(
        (selectId && selectValue) ? { value: selectId, label: selectValue } : null
    );
    const [options, setOptions] = useState<SelectOption[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const currentPageRef = useRef(0);
    const isInitialLoadRef = useRef(true);


    // 💡 FIX 1: Set isMounted to true after the initial client-side render
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // ... (Keep fetchData, handleScroll, handleInputChange, and useEffect(fetchData) hooks) ...
    const fetchData = useCallback(async (isSearch = false) => {
        if (!hasMore && !isSearch) return;
        if (isLoading) return;

        setIsLoading(true);
        const pageToLoad = isSearch ? 0 : currentPageRef.current;

        try {
            const { brands: newBrands, success, hasMore: newHasMore } = await getBrandsBySearch({
                searchTerm: searchTerm,
                skip: pageToLoad * PAGE_SIZE,
                take: PAGE_SIZE,
            });

            if (success) {
                const newOptions = mapBrandsToOptions(newBrands);

                if (isSearch || isInitialLoadRef.current) {
                    setOptions(newOptions);
                } else {
                    setOptions((prevOptions) => [...prevOptions, ...newOptions]);
                }

                currentPageRef.current = pageToLoad + 1;
                setHasMore(newHasMore);
                isInitialLoadRef.current = false;
            }
        } catch (error) {
            console.error("Failed to load options:", error);
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, hasMore, isLoading]);

    const handleScroll = useCallback(() => {
        if (!isLoading && hasMore) {
            fetchData(false);
        }
    }, [isLoading, hasMore, fetchData]);

    const handleInputChange = (newSearchTerm: any) => {
        if (newSearchTerm !== searchTerm) {
            setSearchTerm(newSearchTerm);
            currentPageRef.current = 0;
            setHasMore(true);
            isInitialLoadRef.current = true;
        }
        return newSearchTerm;
    };

    useEffect(() => {
        // Only run fetch logic once mounted
        if (isMounted) {
            fetchData(true);
        }
    }, [searchTerm, isMounted]);

    const handleSelectChange = (option: SelectOption | null) => {
        setSelectedValue(option);
        setFormData?.({ brand_id: option?.value || '' });
    };


    return (
        <div className="">
            <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="brand_select">
                Brand *
            </label>

            {/* 💡 FIX 2: Conditionally render the Select component */}
            {/* We render the select only after it's guaranteed to be on the client.
                This allows the Server Render to produce a predictable (empty or loading) state,
                and the Client Hydration to proceed cleanly before the Select initializes. 
            */}
            {!isMounted ? (
                <div className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-500">
                    Loading component...
                </div>
            ) : (
                <Select<SelectOption>
                    options={options}
                    isLoading={isLoading}
                    isSearchable={true}
                    placeholder="Search for a brand..."
                    onInputChange={handleInputChange}
                    onChange={handleSelectChange}
                    value={selectedValue}
                    components={{ MenuList: CustomMenuList }}
                    selectProps={{ handleScroll, hasMore }}
                />
            )}

            {/* Hidden input remains, but since it relies on state, the conditional rendering 
                on the Select component usually solves the issue.
                If the problem persists, you can also wrap the hidden input with isMounted.
             */}
            <input
                type="hidden"
                name="brand_id"
                value={selectedValue?.value || ''}
            />
        </div>
    )
}

export default OptimizedGetAllBrands;