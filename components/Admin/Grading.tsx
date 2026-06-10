'use client';

import Select, { components } from 'react-select';
import { useState, useCallback, useRef, useEffect } from 'react';
import { getGradingsBySearch } from '@/app/(admin)/admin/(admin)/products/(actions)/product.action';

const PAGE_SIZE = 50;

interface SelectOption {
    value: string;
    label: string;
}

interface Grading {
    id: number;
    title: string;
}

const mapGradingsToOptions = (gradings: Grading[]): SelectOption[] => {
    return gradings.map((grading) => ({
        value: grading.id.toString(),
        label: grading.title,
    }));
};

const CustomMenuList = (props: any) => {
    const { children, selectProps } = props;
    const { handleScroll } = selectProps;

    const scrollRef = useRef<HTMLDivElement | null>(null);

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
                    <div className="p-2 text-center text-gray-500">
                        Loading more grades...
                    </div>
                )}
            </div>
        </components.MenuList>
    );
};

const OptimizedGetAllGradings = ({
    selectValue,
    selectId,
    setFormData,
}: {
    selectValue?: string;
    selectId?: string;
    setFormData?: (value: any) => void | null;
}) => {
    const [isMounted, setIsMounted] = useState(false);

    const [selectedValue, setSelectedValue] = useState<SelectOption | null>(
        selectId && selectValue ? { value: selectId, label: selectValue } : null
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
            const {
                gradings: newGradings,
                success,
                hasMore: newHasMore,
            } = await getGradingsBySearch({
                searchTerm,
                skip: pageToLoad * PAGE_SIZE,
                take: PAGE_SIZE,
            });

            if (success) {
                const newOptions = mapGradingsToOptions(newGradings);

                if (isSearch || isInitialLoadRef.current) {
                    setOptions(newOptions);
                } else {
                    setOptions((prevOptions) => [
                        ...prevOptions,
                        ...newOptions,
                    ]);
                }

                currentPageRef.current = pageToLoad + 1;
                setHasMore(newHasMore);
                isInitialLoadRef.current = false;
            }
        } catch (error) {
            console.error("Failed to load grades:", error);
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

    const handleInputChange = (newSearchTerm: string) => {
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

        setFormData?.({
            grading_id: option?.value || '',
        });
    };

    return (
        <div>
            <label
                className="block text-sm font-semibold text-gray-700 mb-2"
                htmlFor="grading_select"
            >
                Grade
            </label>

            {!isMounted ? (
                <div className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-500">
                    Loading component...
                </div>
            ) : (
                <Select<SelectOption>
                    inputId="grading_select"
                    options={options}
                    isLoading={isLoading}
                    isSearchable={true}
                    placeholder="Search for a grade..."
                    onInputChange={handleInputChange}
                    onChange={handleSelectChange}
                    value={selectedValue}
                    components={{ MenuList: CustomMenuList }}
                    selectProps={{ handleScroll, hasMore } as any}
                />
            )}

            <input
                type="hidden"
                name="grading_id"
                value={selectedValue?.value || ''}
            />
        </div>
    );
};

export default OptimizedGetAllGradings;