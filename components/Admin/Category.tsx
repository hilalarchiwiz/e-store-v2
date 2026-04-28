'use client';

import Select, { components } from 'react-select';
import { getCategoriesBySearch } from "@/app/(admin)/admin/(admin)/products/(actions)/product.action"
import { useState, useCallback, useRef, useEffect } from 'react';
import { Category } from '@/types/category';

const PAGE_SIZE = 50;

interface SelectOption {
    value: string;
    label: string;
    specifications: Object
}

const mapCategoriesToOptions = (Categories: Category[]): SelectOption[] => {
    return Categories.map((category) => ({
        value: category.id.toString(),
        label: category.title,
        specifications: category.specifications,
    }));
};

const CustomMenuList = (props: any) => {
    const { options, children, getValue, selectProps } = props;
    const { handleScroll } = selectProps;

    const scrollRef = useRef(null);

    const onScroll = () => {
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
                    <div className="p-2 text-center text-gray-500">Loading more Categories...</div>
                )}
            </div>
        </components.MenuList>
    );
};


const OptimizedGetAllCategory = ({ selectValue, selectId, setFormData, setSpecifications }: {
    selectValue?: string | undefined, // This is the category Title (e.g., "Apple")
    selectId?: string | undefined,    // <--- ADD THIS PROP (The category ID)
    setFormData?: (data: any) => void | null,   // <--- ADD THIS PROP (The category ID)
    setSpecifications?: (data: any) => void | null,   // <--- ADD THIS PROP (The category ID)
}) => {
    // 💡 NEW: State to track if the component has mounted on the client
    const [isMounted, setIsMounted] = useState(false);

    // Existing states
    const [selectedValue, setSelectedValue] = useState<SelectOption | null | undefined>(
        (selectId && selectValue) ? { value: selectId, label: selectValue, specifications: {} } : null
    ); const [options, setOptions] = useState<SelectOption[]>([]);
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
            const { categories: newCategory, success, hasMore: newHasMore } = await getCategoriesBySearch({
                searchTerm: searchTerm,
                skip: pageToLoad * PAGE_SIZE,
                take: PAGE_SIZE,
            });

            if (success) {
                const newOptions = mapCategoriesToOptions(newCategory);

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
        if (isMounted) {
            fetchData(true);
        }
    }, [searchTerm, isMounted]);

    const handleSelectChange = (option: SelectOption | null) => {
        setSelectedValue(option);
        setFormData?.({ category_id: option?.value || '' });
        setSpecifications?.(option?.specifications);
    };


    return (
        <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="category_select">
                Category *
            </label>
            {!isMounted ? (
                <div className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-500">
                    Loading component...
                </div>
            ) : (
                <Select<SelectOption>
                    options={options}
                    isLoading={isLoading}
                    isSearchable={true}
                    placeholder="Search for a category..."
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
                name="category_id"
                value={selectedValue?.value || ''}
            />
        </div>
    )
}

export default OptimizedGetAllCategory;