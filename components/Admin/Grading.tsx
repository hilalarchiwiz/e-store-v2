'use client';

import Select, { components, MenuListProps } from 'react-select';
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

    const scrollRef = useRef<HTMLDivElement | null>(null);

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
    setFormData?: (value: Record<string, string>) => void;
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

            if (success && newGradings) {
                const newOptions = mapGradingsToOptions(newGradings);

                setOptions((prevOptions) => {
                    if (isSearch) {
                        return newOptions;
                    }
                    const existingIds = new Set(prevOptions.map((opt) => opt.value));
                    const uniqueNewOptions = newOptions.filter(
                        (opt) => !existingIds.has(opt.value)
                    );
                    return [...prevOptions, ...uniqueNewOptions];
                });

                setHasMore(newHasMore);
                currentPageRef.current = pageToLoad + 1;
            }
        } catch (error) {
            console.error('Error fetching gradings:', error);
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

    const handleInputChange = (newSearchTerm: string) => {
        setSearchTerm(newSearchTerm);
        return newSearchTerm;
    };

    const handleSelectChange = (option: SelectOption | null) => {
        setSelectedValue(option);

        if (setFormData && option) {
            setFormData({
                grading_id: option.value,
                grading_title: option.label,
            });
        }
    };

    const handleScroll = () => {
        if (!isLoading && hasMore) {
            fetchData(false);
        }
    };

    return (
        <div className="w-full">
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
                    components={{ MenuList: CustomMenuList as unknown as typeof components.MenuList }}
                    {...({ selectProps: { handleScroll, hasMore } } as unknown as Record<string, unknown>)}
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