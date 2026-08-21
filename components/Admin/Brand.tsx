'use client';

import Select from 'react-select';
import { getBrandsBySearch } from "@/app/(admin)/admin/(admin)/products/(actions)/product.action";
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

const OptimizedGetAllBrands = ({ selectValue, selectId, setFormData }: {
    selectValue?: string | undefined,
    selectId?: string | undefined,
    setFormData?: (value: Record<string, string>) => void | null,
}) => {
    const [isMounted, setIsMounted] = useState(false);

    const [selectedValue, setSelectedValue] = useState<SelectOption | null | undefined>(
        (selectId && selectValue) ? { value: selectId, label: selectValue } : null
    );
    const [options, setOptions] = useState<SelectOption[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const currentPageRef = useRef(0);
    const isInitialLoadRef = useRef(true);
    const isLoadingRef = useRef(false);
    const requestIdRef = useRef(0);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const fetchData = useCallback(async (term: string, page: number, replace: boolean) => {
        if (isLoadingRef.current && !replace) return;

        const requestId = ++requestIdRef.current;
        isLoadingRef.current = true;
        setIsLoading(true);

        try {
            const { brands: newBrand, success, hasMore: newHasMore } = await getBrandsBySearch({
                searchTerm: term,
                skip: page * PAGE_SIZE,
                take: PAGE_SIZE,
            });

            if (requestId !== requestIdRef.current) return;

            if (success && newBrand) {
                const newOptions = mapBrandsToOptions(newBrand);

                setOptions((prevOptions) => {
                    if (replace) {
                        return newOptions;
                    }
                    const existingIds = new Set(prevOptions.map((opt) => opt.value));
                    const uniqueNewOptions = newOptions.filter((opt) => !existingIds.has(opt.value));
                    return [...prevOptions, ...uniqueNewOptions];
                });

                setHasMore(newHasMore);
                currentPageRef.current = page + 1;
            }
        } catch (error) {
            console.error("Error fetching brands:", error);
        } finally {
            if (requestId === requestIdRef.current) {
                isLoadingRef.current = false;
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        if (isInitialLoadRef.current) {
            isInitialLoadRef.current = false;
            void fetchData(searchTerm, 0, true);
            return;
        }

        const handler = setTimeout(() => {
            currentPageRef.current = 0;
            setHasMore(true);
            void fetchData(searchTerm, 0, true);
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerm, isMounted, fetchData]);

    const handleScroll = () => {
        if (!isLoadingRef.current && hasMore) {
            void fetchData(searchTerm, currentPageRef.current, false);
        }
    };

    const handleInputChange = (newSearchTerm: string) => {
        setSearchTerm(newSearchTerm);
        return newSearchTerm;
    };

    const handleSelectChange = (option: SelectOption | null) => {
        setSelectedValue(option);
        setFormData?.({ brand_id: option?.value || '' });
    };

    return (
        <div className="">
            <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="brand_select">
                Brand *
            </label>

            {!isMounted ? (
                <div className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-500">
                    Loading component...
                </div>
            ) : (
                <Select<SelectOption>
                    inputId="brand_select"
                    options={options}
                    isLoading={isLoading}
                    isSearchable={true}
                    placeholder="Search for a brand..."
                    onInputChange={handleInputChange}
                    onChange={handleSelectChange}
                    onMenuScrollToBottom={handleScroll}
                    value={selectedValue}
                />
            )}

            <input
                type="hidden"
                name="brand_id"
                value={selectedValue?.value || ''}
            />
        </div>
    );
};

export default OptimizedGetAllBrands;
