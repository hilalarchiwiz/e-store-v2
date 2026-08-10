'use client'

import { useState } from 'react';
import { ArrowLeft, Plus, X, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import GetAllBrands from '@/components/Admin/Brand';

export default function CreateProductPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        warranty: '',
        brandId: '',
        categoryId: '',
        price: '',
        discountedPrice: '',
        additionalInfo: '',
        status: 'active' as 'active' | 'inactive'
    });

    const [colors, setColors] = useState<string[]>([]);
    const [colorInput, setColorInput] = useState('');

    const [images, setImages] = useState<string[]>([]);
    const [imageInput, setImageInput] = useState('');

    const [specifications, setSpecifications] = useState<{ key: string; value: string }[]>([
        { key: '', value: '' }
    ]);

    // Sample data for dropdowns
    const brands = [
        { id: 1, name: 'Nike' },
        { id: 2, name: 'Adidas' },
        { id: 3, name: 'Puma' }
    ];

    const categories = [
        { id: 1, name: 'Electronics' },
        { id: 2, name: 'Fashion' },
        { id: 3, name: 'Home & Garden' }
    ];

    // Add color
    const handleAddColor = () => {
        if (colorInput.trim() && !colors.includes(colorInput.trim())) {
            setColors([...colors, colorInput.trim()]);
            setColorInput('');
        }
    };

    // Remove color
    const handleRemoveColor = (index: number) => {
        setColors(colors.filter((_, i) => i !== index));
    };

    // Add image
    const handleAddImage = () => {
        if (imageInput.trim() && !images.includes(imageInput.trim())) {
            setImages([...images, imageInput.trim()]);
            setImageInput('');
        }
    };

    // Remove image
    const handleRemoveImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    // Add specification row
    const handleAddSpecification = () => {
        setSpecifications([...specifications, { key: '', value: '' }]);
    };

    // Remove specification row
    const handleRemoveSpecification = (index: number) => {
        setSpecifications(specifications.filter((_, i) => i !== index));
    };

    // Update specification
    const handleSpecificationChange = (index: number, field: 'key' | 'value', value: string) => {
        const updated = [...specifications];
        updated[index][field] = value;
        setSpecifications(updated);
    };

    // Submit form
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Convert specifications array to object
        const specsObject = specifications.reduce((acc, spec) => {
            if (spec.key.trim()) {
                acc[spec.key] = spec.value;
            }
            return acc;
        }, {} as { [key: string]: string });

        const newProduct = {
            ...formData,
            brandId: parseInt(formData.brandId),
            categoryId: parseInt(formData.categoryId),
            price: parseFloat(formData.price),
            discountedPrice: formData.discountedPrice ? parseFloat(formData.discountedPrice) : undefined,
            color: colors,
            images: images,
            specifications: specsObject,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
        };

        console.log('New Product:', newProduct);
        // Here you would typically send this to your API

        // Redirect back to products list
        router.push('/admin/products');
    };

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

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Basic Information</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Title */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Product Title *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                placeholder="e.g., Wireless Headphones Pro"
                            />
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                                placeholder="Detailed product description..."
                            />
                        </div>

                        {/* Brand */}
                        <GetAllBrands />

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Category *
                            </label>
                            <select
                                required
                                value={formData.categoryId}
                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            >
                                <option value="">Select Category</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Warranty */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Warranty *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.warranty}
                                onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                placeholder="e.g., 2 Years"
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Status *
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Pricing */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Pricing</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Price */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Price ($) *
                            </label>
                            <input
                                type="number"
                                required
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                placeholder="0.00"
                            />
                        </div>

                        {/* Discounted Price */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Discounted Price ($)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.discountedPrice}
                                onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>

                {/* Colors */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Colors</h2>

                    <div className="flex gap-3 mb-4">
                        <input
                            type="text"
                            value={colorInput}
                            onChange={(e) => setColorInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddColor())}
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            placeholder="Enter color name"
                        />
                        <button
                            type="button"
                            onClick={handleAddColor}
                            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {colors.map((color, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg"
                            >
                                {color}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveColor(index)}
                                    className="hover:text-purple-900"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Images */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Product Images</h2>

                    <div className="flex gap-3 mb-4">
                        <input
                            type="text"
                            value={imageInput}
                            onChange={(e) => setImageInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            placeholder="Enter image URL"
                        />
                        <button
                            type="button"
                            onClick={handleAddImage}
                            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {images.map((image, index) => (
                            <div key={index} className="relative group">
                                <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100">
                                    <Image
                                        src={image}
                                        alt={`Product ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(index)}
                                    className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Specifications */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Specifications</h2>
                        <button
                            type="button"
                            onClick={handleAddSpecification}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Spec
                        </button>
                    </div>

                    <div className="space-y-3">
                        {specifications.map((spec, index) => (
                            <div key={index} className="flex gap-3">
                                <input
                                    type="text"
                                    value={spec.key}
                                    onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                    placeholder="Specification name (e.g., Battery Life)"
                                />
                                <input
                                    type="text"
                                    value={spec.value}
                                    onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                    placeholder="Value (e.g., 30 hours)"
                                />
                                {specifications.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSpecification(index)}
                                        className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Additional Information */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Additional Information</h2>

                    <textarea
                        value={formData.additionalInfo}
                        onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                        placeholder="Any additional information about the product..."
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <Link
                        href="/admin/products"
                        className="flex-1 px-6 py-3 text-center text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-purple-600/30"
                    >
                        <Save className="w-5 h-5" />
                        Create Product
                    </button>
                </div>
            </form>
        </div>
    );
}
