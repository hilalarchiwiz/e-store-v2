
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Form from '@/components/Admin/Form';
import { SubmitButton } from '@/components/Admin/SubmitButton'; // Import the new button
import { getProductById, updateProduct } from '../../(actions)/product.action';
import OptimizedGetAllBrands from '@/components/Admin/Brand';
import OptimizedGetAllCategory from '@/components/Admin/Category';
import UploadMultipleFiles from '@/components/Admin/UploadMultipleFiles';
import Specification from '@/components/Admin/Specification';
import AdditionalInfo from '@/components/Admin/AdditionalInfo';
export async function generateMetadata({ params }: any) {
    const { id } = await params;
    const product = await getProductById(id);
    return {
        title: 'Edit Product - ' + product?.title,
    };
}

export default async function EditProductPage({ params }: any) {
    const { id } = await params;
    const productId = Number(id);
    const product = await getProductById(id);
    return (
        <div className="py-8">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/admin/products"
                    className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Products
                </Link>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Create New Product</h1>
                <p className="text-gray-600">Add a new product to your inventory</p>
            </div>

            <Form action={updateProduct} id={productId}> {/* Added spacing between sections */}
                {/* Basic Information */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Basic Information</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Title */}
                        <div className="md:col-span-2">
                            <label htmlFor='title' className="block text-sm font-semibold text-gray-700 mb-2">
                                Product Title *
                            </label>
                            <input
                                id='title'
                                type="text"
                                name='title'
                                defaultValue={product?.title}
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                placeholder="e.g., Wireless Headphones Pro"
                            />
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label htmlFor='description' className="block text-sm font-semibold text-gray-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                id='description'
                                defaultValue={product?.description}
                                required
                                name='description'
                                rows={4}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                                placeholder="Detailed product description..."
                            />
                        </div>

                        {/* Brand and Category will use your OptimizedGetAllBrands/Category components,
                            which must ensure their select inputs have the names 'brandId' and 'categoryId' respectively. */}
                        <OptimizedGetAllBrands
                            selectValue={product?.brand?.title}
                            selectId={product?.brand?.id.toString()} // Pass the ID too!
                        />
                        <OptimizedGetAllCategory
                            selectValue={product?.category?.title}
                            selectId={product?.category?.id.toString()} // Pass the ID too!
                        />
                        {/* Warranty */}
                        <div>
                            <label htmlFor='warranty' className="block text-sm font-semibold text-gray-700 mb-2">
                                Warranty *
                            </label>
                            <input
                                id='warranty'
                                type="text"
                                name='warranty'
                                defaultValue={product?.warranty}
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                placeholder="e.g., 2 Years"
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label htmlFor='status' className="block text-sm font-semibold text-gray-700 mb-2">
                                Quantity
                            </label>
                            <input
                                id='quantity'
                                type="number"
                                name='quantity'
                                step="1"
                                min="0"
                                defaultValue={product?.quantity}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                placeholder="00"
                            />
                        </div>
                    </div>
                </div>

                {/* Pricing */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Pricing</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Price */}
                        <div>
                            <label htmlFor='price' className="block text-sm font-semibold text-gray-700 mb-2">
                                Price (Rs) *
                            </label>
                            <input
                                id='price'
                                type="number"
                                required
                                name='price'
                                defaultValue={product?.price}
                                step="0.01"
                                min="0"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                placeholder="0.00"
                            />
                        </div>


                        {/* Discounted Price */}
                        <div>
                            <label htmlFor='discount_price' className="block text-sm font-semibold text-gray-700 mb-2">
                                Discounted Price (%)
                            </label>
                            <input
                                id='discount_price'
                                type="number"
                                step="0.01"
                                defaultValue={product?.discountedPrice}
                                min="0"
                                name="discount_price"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>

                {/* Images - Make sure UploadMultipleFiles names its file inputs 'images' */}
                <UploadMultipleFiles
                    defaultImages={product?.images}
                />
                {/* Specifications */}
                <Specification defaultSpecs={product?.specifications} />

                {/* Additional Information */}
                <AdditionalInfo defaultValue={product?.additionalInfo} />

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4">
                    <Link
                        href="/admin/products"
                        className="px-6 py-3 text-center text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors"
                    >
                        Cancel
                    </Link>
                    {/* The new SubmitButton handles the loading state */}
                    <SubmitButton title="Update Product" />
                </div>
            </Form>
        </div>
    );
}