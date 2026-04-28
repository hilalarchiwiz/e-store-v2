'use client'

import { useState } from "react"

const ProductImage = ({ product }) => {
    const [selectedImage, setSelectedImage] = useState(product.images[0])
    return (
        <div className="p-4">
            <div className="mb-4 bg-gray-50 rounded-lg overflow-hidden aspect-square flex items-center justify-center">
                <img
                    src={selectedImage}
                    alt="Product"
                    className="w-full h-full object-contain"
                />
            </div>
            <div className="grid grid-cols-3 gap-2">
                {product.images.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedImage(img)}
                        className={`aspect-square bg-gray-50 rounded-lg overflow-hidden border-2 transition ${selectedImage === img ? 'border-purple-600' : 'border-transparent'
                            }`}
                    >
                        <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-contain" />
                    </button>
                ))}
            </div>
        </div>

    )
}

export default ProductImage