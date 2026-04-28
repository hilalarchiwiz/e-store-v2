'use client';

import { useEffect, useState } from 'react';
import { getSubCategoriesByCategoryId } from '@/app/(admin)/admin/(admin)/products/(actions)/product.action';

interface SubCat {
    id: number;
    title: string;
}

interface SubCategorySelectProps {
    categoryId?: string | number | null;
    defaultSubCategoryId?: string | number | null;
}

const SubCategorySelect = ({ categoryId, defaultSubCategoryId }: SubCategorySelectProps) => {
    const [subCategories, setSubCategories] = useState<SubCat[]>([]);
    const [selected, setSelected] = useState<string>(
        defaultSubCategoryId ? String(defaultSubCategoryId) : ''
    );
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Reset when category changes
        setSelected('');
        setSubCategories([]);

        if (!categoryId) return;

        setLoading(true);
        getSubCategoriesByCategoryId(Number(categoryId))
            .then((res) => {
                if (res?.success) {
                    setSubCategories(res.subCategories ?? []);
                    // If editing and the default subcategory belongs to this category, restore it
                    if (defaultSubCategoryId) {
                        const match = res.subCategories?.find(
                            (s) => String(s.id) === String(defaultSubCategoryId)
                        );
                        if (match) setSelected(String(match.id));
                    }
                }
            })
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoryId]);

    if (!categoryId) return null;

    return (
        <div className="w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sub-Category <span className="text-gray-400 font-normal">(optional)</span>
            </label>

            {loading ? (
                <div className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-400 text-sm">
                    Loading sub-categories...
                </div>
            ) : subCategories.length === 0 ? (
                <div className="w-full px-4 py-3 border border-gray-200 rounded-md text-gray-400 text-sm bg-gray-50">
                    No sub-categories for this category
                </div>
            ) : (
                <select
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 transition-colors bg-white text-sm"
                >
                    <option value="">-- None --</option>
                    {subCategories.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                            {sub.title}
                        </option>
                    ))}
                </select>
            )}

            {/* Hidden input picked up by FormData */}
            <input type="hidden" name="subcategory_id" value={selected} />
        </div>
    );
};

export default SubCategorySelect;
