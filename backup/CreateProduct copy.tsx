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
import { useCallback, useEffect, useState } from 'react'
import { saveProductDraft } from '../(actions)/product.action'

const CreateProduct = () => {
    const [productId, setProductId] = useState<number | null>(null);
    const [specifications, setSpecifications] = useState([]);
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

    useEffect(() => {
        // Only save if there is at least a title
        if (!formData.category_id && !formData.brand_id) return;

        const delayDebounceFn = setTimeout(async () => {
            const data = new FormData();
            // Append EVERY field from state so the draft isn't empty
            Object.entries(formData).forEach(([key, value]) => {
                // data.append(key, value as string);
                if (key === 'images' && Array.isArray(value)) {
                    // IMPORTANT: Append each image URL separately for Prisma/Server Actions
                    value.forEach(url => data.append('images', url));
                } else if (key === 'specifications') {
                    // If 'value' is an array, convert it to an object first
                    let specObject = value;

                    if (Array.isArray(value)) {
                        specObject = value.reduce((acc: any, curr: any) => {
                            if (curr.key && curr.key.trim() !== "") {
                                acc[curr.key.trim()] = curr.value;
                            }
                            return acc;
                        }, {});
                    }

                    // Now append the stringified OBJECT: {"Generation": "20"}
                    data.append(key, JSON.stringify(specObject));
                } else {
                    data.append(key, value as string);
                }
            });


            const result = await saveProductDraft(productId, data);
            console.log(result)
            if (result.success && !productId) {
                setProductId(result.id);
                console.log("Draft created with ID:", result.id);
            }
        }, 2000);

        return () => clearTimeout(delayDebounceFn);
    }, [formData, productId]);

    // Helper to update specific fields in state
    // const updateField = (update: any) => {
    //     console.log(update);
    //     setFormData(prev => ({ ...prev, ...update }));
    // };
    const updateField = useCallback((update: any) => {
        setFormData(prev => ({ ...prev, ...update }));
    }, []);
    const updateSpecifications = useCallback((update: any) => {
        setSpecifications(update);
    }, []);
    return (
        <>
            <h2 className="text-xl font-bold text-gray-800 ">Basic Information</h2>
            <div className="grid md:grid-cols-2 gap-x-6 space-y-6">
                <input type="text" defaultValue={productId || null} name='productId' />

                <OptimizedGetAllCategory setFormData={updateField} setSpecifications={updateSpecifications} />
                <OptimizedGetAllBrands setFormData={updateField} />
                <SubCategorySelect categoryId={formData.category_id} />


                {/* Title */}
                <div className="md:col-span-2">
                    <FontPicker />
                </div>
                <div className="md:col-span-2">
                    <FormInput
                        label='Product title'
                        required
                        name='title'
                        placeholder="e.g., Wireless Headphones Pro"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                    <FormTextarea label='Product description' required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>

                {/* Warranty */}
                <div>
                    <FormInput
                        label='Product warranty (in days)'
                        required
                        name='warranty'
                        placeholder="e.g., 2"
                        value={formData.warranty}
                        onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                    />
                </div>

                <div>
                    <FormInput
                        label='Product quantity'
                        required
                        type='number'
                        step={'0.01'}
                        name='quantity'
                        placeholder="0"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    />
                </div>
            </div>

            {/* Pricing */}
            <div className="">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Pricing</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Price */}
                    <div>
                        <FormInput
                            label='Product price (in Rs.)'
                            type="number"
                            required
                            name='price'
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                    </div>

                    {/* Discounted Price */}
                    <div>
                        <FormInput
                            label='Product discount (in %.)'
                            type="number"
                            required
                            name='discount_price'
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={formData.discount_price}
                            onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* Images - Make sure UploadMultipleFiles names its file inputs 'images' */}
            <UploadMultipleFiles onImagesChange={(urls) => updateField({ images: urls })} />

            {/* Specifications */}
            <Specification defaultSpecs={specifications} onSpecChange={(specs) => updateField({ specifications: specs })} />

            <AdditionalInfo onChange={(content) => updateField({ additional_information: content })} />
        </>
    )
}

export default CreateProduct