'use client'
import AdditionalInfo from '@/components/Admin/AdditionalInfo'
import OptimizedGetAllBrands from '@/components/Admin/Brand'
import OptimizedGetAllCategory from '@/components/Admin/Category'
import SubCategorySelect from '@/components/Admin/SubCategorySelect'
import FormInput from '@/components/Admin/Form/Input'
import FormTextarea from '@/components/Admin/Form/Textarea'
import Specification from '@/components/Admin/Specification'
import UploadMultipleFiles from '@/components/Admin/UploadMultipleFiles'
import FontPicker from '@/components/Common/FontPicker'
import { useCallback, useEffect, useRef, useState } from 'react'
import { saveProductDraft } from '../(actions)/product.action'
import OptimizedGetAllGradings from '@/components/Admin/Grading'

const CreateProduct = () => {
    const [productId, setProductId] = useState<number | null>(null);
    const [specifications, setSpecifications] = useState([]);
    const [titleCountLoading, setTitleCountLoading] = useState(false);
    const [titleCountInfo, setTitleCountInfo] = useState<{ title: string; count: number } | null>(null);
    const titleDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        warranty: '',
        quantity: '',
        price: '',
        discount_price: '',
        images: [],
        specifications: [],
        brand_id: '',
        category_id: '',
        font: '',
        additional_information: ''
    });

    // ── Fetch product count whenever title changes ──────────────────────────
    useEffect(() => {
        const trimmed = formData.title.trim();

        // Clear previous info if title is empty
        if (!trimmed) {
            setTitleCountInfo(null);
            return;
        }

        if (titleDebounceRef.current) clearTimeout(titleDebounceRef.current);

        titleDebounceRef.current = setTimeout(async () => {
            setTitleCountLoading(true);
            try {
                const res = await fetch(
                    `https://erp.archiwiz.com/api/products/count?title=${encodeURIComponent(trimmed)}`
                );
                const data = await res.json();

                if (data.success) {
                    setTitleCountInfo({ title: data.title, count: data.count });
                    // Auto-fill quantity with the fetched count
                    setFormData(prev => ({ ...prev, quantity: String(data.count) }));
                } else {
                    setTitleCountInfo(null);
                }
            } catch (err) {
                console.error('Failed to fetch product count:', err);
                setTitleCountInfo(null);
            } finally {
                setTitleCountLoading(false);
            }
        }, 800); // 800 ms debounce — fast enough to feel live

        return () => {
            if (titleDebounceRef.current) clearTimeout(titleDebounceRef.current);
        };
    }, [formData.title]);

    // ── Draft auto-save ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!formData.category_id && !formData.brand_id) return;

        const delayDebounceFn = setTimeout(async () => {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'images' && Array.isArray(value)) {
                    value.forEach(url => data.append('images', url));
                } else if (key === 'specifications') {
                    let specObject = value;
                    if (Array.isArray(value)) {
                        specObject = value.reduce((acc: any, curr: any) => {
                            if (curr.key && curr.key.trim() !== '') {
                                acc[curr.key.trim()] = curr.value;
                            }
                            return acc;
                        }, {});
                    }
                    data.append(key, JSON.stringify(specObject));
                } else {
                    data.append(key, value as string);
                }
            });

            const result = await saveProductDraft(productId, data);
            if (result.success && !productId) {
                setProductId(result.id);
            }
        }, 2000);

        return () => clearTimeout(delayDebounceFn);
    }, [formData, productId]);

    const updateField = useCallback((update: any) => {
        setFormData(prev => ({ ...prev, ...update }));
    }, []);

    const updateSpecifications = useCallback((update: any) => {
        setSpecifications(update);
    }, []);

    return (
        <>
            <h2 className="text-xl font-bold text-gray-800">Basic Information</h2>
            <div className="grid md:grid-cols-2 gap-x-6 space-y-6">
                <input type="text" defaultValue={productId || ''} name="productId" />

                <OptimizedGetAllCategory setFormData={updateField} setSpecifications={updateSpecifications} />
                <OptimizedGetAllBrands setFormData={updateField} />
                <SubCategorySelect categoryId={formData.category_id} />
                <OptimizedGetAllGradings setFormData={updateField} />

                <div className="md:col-span-2">
                    <FontPicker />
                </div>

                {/* Title — with live count badge */}
                <div className="md:col-span-2">
                    <div className="relative">
                        <FormInput
                            label="Product title"
                            required
                            name="title"
                            placeholder="e.g., Wireless Headphones Pro"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                        {/* Status badge sits below the input */}
                        <div className="mt-1 h-5 text-sm">
                            {titleCountLoading && (
                                <span className="text-gray-400 animate-pulse">
                                    Checking stock count…
                                </span>
                            )}
                            {!titleCountLoading && titleCountInfo && (
                                <span className="text-green-600 font-medium">
                                    ✓ &quot;{titleCountInfo.title}&quot; — {titleCountInfo.count} units found, quantity updated
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                    <FormTextarea
                        label="Product description"
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                {/* Warranty */}
                <div>
                    <FormInput
                        label="Product warranty (in days)"
                        required
                        name="warranty"
                        placeholder="e.g., 2"
                        value={formData.warranty}
                        onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                    />
                </div>

                {/* Quantity — auto-filled from title count */}
                <div>
                    <FormInput
                        label="Product quantity"
                        required
                        type="text"
                        step="0.01"
                        name="quantity"
                        placeholder="0"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    />
                </div>
            </div>

            {/* Pricing */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6">Pricing</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <FormInput
                            label="Product price (in Rs.)"
                            type="text"
                            required
                            name="price"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                    </div>
                    <div>
                        <FormInput
                            label="Product discount (in %.)"
                            type="text"
                            required
                            name="discount_price"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={formData.discount_price}
                            onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <UploadMultipleFiles onImagesChange={(urls) => updateField({ images: urls })} />
            <Specification defaultSpecs={specifications} onSpecChange={(specs) => updateField({ specifications: specs })} />
            <AdditionalInfo onChange={(content) => updateField({ additional_information: content })} />
        </>
    );
};

export default CreateProduct;