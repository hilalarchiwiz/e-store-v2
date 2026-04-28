'use client'

import OptimizedGetAllBrands from '@/components/Admin/Brand'
import OptimizedGetAllCategory from '@/components/Admin/Category'
import SubCategorySelect from '@/components/Admin/SubCategorySelect'
import FormInput from '@/components/Admin/Form/Input'
import FormTextarea from '@/components/Admin/Form/Textarea'
import Specification from '@/components/Admin/Specification'
import UploadMultipleFiles from '@/components/Admin/UploadMultipleFiles'
import AdditionalInfo from '@/components/Admin/AdditionalInfo'
import FontPicker from '@/components/Common/FontPicker'
import { useCallback, useState } from 'react'

interface EditProductProps {
    product: any
}

const EditProduct = ({ product }: EditProductProps) => {
    const [categoryId, setCategoryId] = useState<string>(
        product?.category?.id?.toString() ?? ''
    )

    const handleCategoryChange = useCallback((data: any) => {
        if (data?.category_id !== undefined) {
            setCategoryId(data.category_id)
        }
    }, [])

    return (
        <>
            <div className="grid md:grid-cols-2 gap-x-6 space-y-6">
                <h2 className="text-xl font-bold text-gray-800">Basic Information</h2>

                <div className="md:col-span-2">
                    <FontPicker defaultValue={product?.titleFont || ''} />
                </div>

                <div className="md:col-span-2">
                    <FormInput
                        label="Product title"
                        defaultValue={product?.title}
                        required
                        name="title"
                        placeholder="e.g., Wireless Headphones Pro"
                    />
                </div>

                <div className="md:col-span-2">
                    <FormTextarea
                        label="Product description"
                        defaultValue={product?.description}
                        required
                    />
                </div>

                <OptimizedGetAllCategory
                    selectValue={product?.category?.title}
                    selectId={product?.category?.id?.toString()}
                    setFormData={handleCategoryChange}
                />

                <OptimizedGetAllBrands
                    selectValue={product?.brand?.title}
                    selectId={product?.brand?.id?.toString()}
                />

                <SubCategorySelect
                    categoryId={categoryId}
                    defaultSubCategoryId={product?.subCategoryId}
                />

                <div>
                    <FormInput
                        label="Product warranty (in days)"
                        required
                        defaultValue={product?.warranty}
                        name="warranty"
                        placeholder="e.g., 2"
                    />
                </div>

                <div>
                    <FormInput
                        label="Product quantity"
                        required
                        type="number"
                        step="0.01"
                        defaultValue={product?.quantity}
                        name="quantity"
                        placeholder="0"
                    />
                </div>
            </div>

            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6">Pricing</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <FormInput
                            label="Product price (in Rs.)"
                            type="number"
                            required
                            defaultValue={product?.price}
                            name="price"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <FormInput
                            label="Product discount (in %.)"
                            type="number"
                            required
                            name="discount_price"
                            defaultValue={product?.discountedPrice}
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                        />
                    </div>
                </div>
            </div>

            <UploadMultipleFiles defaultImages={product?.images} />

            <Specification defaultSpecs={product?.specifications} />

            <AdditionalInfo defaultValue={product?.additionalInfo} />
        </>
    )
}

export default EditProduct
