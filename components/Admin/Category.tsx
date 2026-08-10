'use client';

import Select, { components, MenuListProps } from 'react-select';
import { getCategoriesBySearch } from "@/app/(admin)/admin/(admin)/products/(actions)/product.action";
import { useState, useCallback, useRef, useEffect } from 'react';
import { Category } from '@/types/category';

const PAGE_SIZE = 50;

interface SelectOption {
    value: string;
    label: string;
    specifications: Record<string, unknown>;
}

const mapCategoriesToOptions = (Categories: Category[]): SelectOption[] => {
    return Categories.map((category) => ({
        value: category.id.toString(),
        label: category.title,
        specifications: category.specifications as Record<string, unknown>,
    }));
};

interface CustomSelectProps {
    handleScroll?: () => void;
    hasMore?: boolean;
}

type CustomMenuListProps = MenuListProps<SelectOption, false> & {
    selectProps: CustomSelectProps;
};

const CustomMenuList = (props: CustomMenuListProps) => {
    const { children, selectProps } = props;
    const { handleScroll, hasMore } = selectProps;

    const scrollRef = useRef<HTMLDivElement>(null);

    const onScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        if (scrollHeight - scrollTop <= clientHeight + 1) {
            handleScroll?.();
        }
    };

    return (
        <components.MenuList {...(props as unknown as MenuListProps<SelectOption, false>)}>
            <div
                ref={scrollRef}
                onScroll={onScroll}
                style={{ maxHeight: '300px', overflowY: 'auto' }}
            >
                {children}
                {hasMore && (
                    <div className="p-2 text-center text-gray-500">Loading more Categories...</div>
                )}
            </div>
        </components.MenuList>
    );
};


const OptimizedGetAllCategory = ({ selectValue, selectId, setFormData, setSpecifications }: {
    selectValue?: string | undefined,
    selectId?: string | undefined,
    setFormData?: (data: Record<string, string>) => void | null,
    setSpecifications?: (data: unknown) => void | null,
}) => {
    const [isMounted, setIsMounted] = useState(false);

    const [selectedValue, setSelectedValue] = useState<SelectOption | null | undefined>(
        (selectId && selectValue) ? { value: selectId, label: selectValue, specifications: {} } : null
    );
    const [options, setOptions] = useState<SelectOption[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const currentPageRef = useRef(0);
    const isInitialLoadRef = useRef(true);

    useEffect(() => {
        setIsMounted(true);
    }, []);

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

            if (success && newCategory) {
                const newOptions = mapCategoriesToOptions(newCategory);

                setOptions((prevOptions) => {
                    if (isSearch) {
                        return newOptions;
                    }
                    const existingIds = new Set(prevOptions.map((opt) => opt.value));
                    const uniqueNewOptions = newOptions.filter((opt) => !existingIds.has(opt.value));
                    return [...prevOptions, ...uniqueNewOptions];
                });

                setHasMore(newHasMore);
                currentPageRef.current = pageToLoad + 1;
            }
        } catch (error) {
            console.error("Error fetching Categories:", error);
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, hasMore, isLoading]);

    useEffect(() => {
        if (!isMounted) return;

        if (isInitialLoadRef.current) {
            isInitialLoadRef.current = false;
            fetchData(false);
        }
    }, [isMounted, fetchData]);

    useEffect(() => {
        if (!isMounted || isInitialLoadRef.current) return;

        const handler = setTimeout(() => {
            currentPageRef.current = 0;
            setHasMore(true);
            fetchData(true);
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerm, isMounted, fetchData]);

    const handleScroll = () => {
        if (!isLoading && hasMore) {
            fetchData(false);
        }
    };

    const handleInputChange = (newSearchTerm: string) => {
        setSearchTerm(newSearchTerm);
        return newSearchTerm;
    };

    const handleSelectChange = (option: SelectOption | null) => {
        setSelectedValue(option);
        setFormData?.({
            category_id: option?.value || '',
            category_title: option?.label || '',
        });

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
                    components={{ MenuList: CustomMenuList as unknown as typeof components.MenuList }}
                    {...({ selectProps: { handleScroll, hasMore } } as unknown as Record<string, unknown>)}
                />
            )}

            <input
                type="hidden"
                name="category_id"
                value={selectedValue?.value || ''}
            />
        </div>
    );
};

export default OptimizedGetAllCategory;