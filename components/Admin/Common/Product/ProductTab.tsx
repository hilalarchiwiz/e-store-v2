'use client'
import { useState } from "react";
const ProductTab = ({ tabs, product }) => {
    const [activeTab, setActiveTab] = useState('overview');

    const [selectedImage, setSelectedImage] = useState(product.images[0]);

    const calculateDiscount = () => {
        if (product.discountedPrice) {
            const discountPrice = (product?.discountedPrice / 100) * product.price;
            const discount = product?.price - discountPrice;
            return Math.round(discount);
        }
    };

    return (
        <div className="bg-white overflow-hidden">
            <div className="border-b border-gray-200">
                <div className="flex">
                    {
                        tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-4 font-medium transition relative ${activeTab === tab.id
                                    ? 'text-emerald-600 bg-emerald-50'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"></div>
                                )}
                            </button>
                        ))
                    }
                </div>
            </div>

            <div className="p-6">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                {product.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="text-sm text-gray-500 mb-1">Warranty</div>
                                <div className="text-lg font-semibold text-gray-900">{product.warranty} Years</div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="text-sm text-gray-500 mb-1">Reviews</div>
                                <div className="text-lg font-semibold text-gray-900">
                                    {product.reviews?.length} Reviews
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="text-sm text-gray-500 mb-1">Wishlist</div>
                                <div className="text-lg font-semibold text-gray-900">
                                    {product.wishlists.length} Users
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="text-sm text-gray-500 mb-1">Status</div>
                                <div className="text-lg font-semibold text-green-600 capitalize">{product.status}</div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'specifications' && (
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Specifications</h3>
                        {Object.entries(product.specifications).map(([key, value]) => (
                            <div key={key} className="flex items-start border-b border-gray-100 pb-3">
                                <div className="w-1/3 text-sm font-medium text-gray-700">{key}</div>
                                <div className="w-2/3 text-sm text-gray-600">{value}</div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'images' && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Gallery</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {product.images.map((img, idx) => (
                                <div key={idx} className="aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                                    <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-contain" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'pricing' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Pricing Details</h3>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                                <div className="text-sm text-blue-700 mb-2">Original Price</div>
                                <div className="text-3xl font-bold text-blue-900">
                                    Rs. {product.price.toLocaleString()}
                                </div>
                            </div>

                            {
                                product.discountedPrice ? (
                                    <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                                        <div className="text-sm text-green-700 mb-2">Sale Price</div>
                                        <div className="text-3xl font-bold text-green-900">
                                            Rs. {calculateDiscount()}
                                        </div>
                                    </div>
                                ) : ('')
                            }
                        </div>

                        <div className="p-6 bg-gray-50 rounded-xl">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-gray-700 font-medium">Discount Amount</span>
                                <span className="text-2xl font-bold text-red-600">
                                    Rs. {product.discountedPrice
                                        ? ((product?.discountedPrice / 100) * product.price)
                                        : product.price.toLocaleString()}
                                </span>
                            </div>
                            {
                                product.discountedPrice ? (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-700 font-medium">Discount Percentage</span>
                                        <span className="text-2xl font-bold text-red-600">
                                            {product.discountedPrice}%
                                        </span>
                                    </div>
                                ) : ('')
                            }
                        </div>
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Activity</h3>

                        <div className="space-y-3">
                            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900">Product Updated</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {new Date(product.updatedAt).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900">Product Created</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {new Date(product.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProductTab