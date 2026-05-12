"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Pencil, Eye, DollarSign, X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import DataTable from '@/components/Admin/Common/DataTable';
import DeleteButton from '@/components/Admin/Buttons/DeleteButton';
import { deleteProduct, updateProductPrice } from '../(actions)/product.action';
import toast from 'react-hot-toast';

interface ProductTableProps {
    products: any[];
    currentPage: number;
    limit: number;
    canEdit: boolean;
    canDelete: boolean;
    canView: boolean;
}

export default function ProductTable({
    products,
    currentPage,
    limit,
    canEdit,
    canDelete,
    canView
}: ProductTableProps) {
    const [selectedProductForPrice, setSelectedProductForPrice] = useState<any>(null);
    const [selectedProductForImage, setSelectedProductForImage] = useState<any>(null);

    const productColumns = [
        {
            header: "SN",
            accessor: (_: any, index: number) => (currentPage - 1) * limit + (index + 1),
        },
        {
            header: "Image",
            accessor: (product: any) => {
                return (
                    <div 
                        className="relative w-10 h-10 border rounded overflow-hidden bg-gray-50 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setSelectedProductForImage(product)}
                    >
                        <Image
                            unoptimized
                            src={
                                product.images && product.images.length > 0 && product.images[0] !== ''
                                    ? product.images[0]
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(product.title)}&background=94849&color=fff&bold=true`
                            }
                            alt={product.title}
                            fill
                            className="object-contain p-1"
                        />
                    </div>
                )
            },
        },
        { header: "Name", accessor: "title" },
        { header: "Brand", accessor: (product: any) => product.brand?.title },
        { header: "Category", accessor: (product: any) => product.category?.title },
        { header: "Price", accessor: (product: any) => `Rs. ${product.price}` },
        { header: "Quantity", accessor: "quantity" },
        {
            header: "Status",
            accessor: (product: any) => (
                <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                    {product.status}
                </span>
            ),
        },
        ...((canDelete || canView || canEdit) ? [
            {
                header: "Action",
                accessor: (product: any) => (
                    <div className="flex gap-2">
                        {canView && (
                            <Link href={`/admin/products/view/${product.id}`} className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors" title="View Product">
                                <Eye size={14} />
                            </Link>
                        )}
                        {canEdit && (
                            <>
                                <button 
                                    onClick={() => setSelectedProductForPrice(product)}
                                    className="p-2 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 transition-colors"
                                    title="Update Price"
                                >
                                    <DollarSign size={14} />
                                </button>
                                <Link href={`/admin/products/edit/${product.id}`} className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors" title="Edit Product">
                                    <Pencil size={14} />
                                </Link>
                            </>
                        )}
                        {canDelete && <DeleteButton id={product.id} action={deleteProduct} />}
                    </div>
                ),
            }
        ] : [])
    ];

    return (
        <>
            <DataTable data={products} columns={productColumns} />
            
            {selectedProductForPrice && (
                <PriceModal 
                    product={selectedProductForPrice} 
                    onClose={() => setSelectedProductForPrice(null)} 
                />
            )}
            
            {selectedProductForImage && (
                <ImageSliderModal 
                    product={selectedProductForImage} 
                    onClose={() => setSelectedProductForImage(null)} 
                />
            )}
        </>
    );
}

function PriceModal({ product, onClose }: { product: any, onClose: () => void }) {
    const [price, setPrice] = useState(product.price);
    const [discountedPrice, setDiscountedPrice] = useState(product.discountedPrice || 0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const finalDiscountedPrice = discountedPrice === "" || discountedPrice === 0 ? null : Number(discountedPrice);
            const result = await updateProductPrice(product.id, Number(price), finalDiscountedPrice);
            if (result.success) {
                toast.success(result.message);
                onClose();
            } else {
                toast.error(result.message || "Failed to update price");
            }
        } catch (error) {
            toast.error("An error occurred while updating price");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Update Price</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleUpdate} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                        <div className="text-sm text-gray-500 font-medium">{product.title}</div>
                    </div>
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.)</label>
                        <input
                            id="price"
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            required
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div>
                        <label htmlFor="discount_price" className="block text-sm font-medium text-gray-700 mb-1">Discounted Price (Rs.)</label>
                        <input
                            id="discount_price"
                            type="number"
                            value={discountedPrice}
                            onChange={(e) => setDiscountedPrice(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            min="0"
                            step="0.01"
                        />
                        <p className="text-xs text-gray-400 mt-1">Set to 0 or leave empty if no discount.</p>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? "Updating..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ImageSliderModal({ product, onClose }: { product: any, onClose: () => void }) {
    const images = product.images && product.images.length > 0 ? product.images : [
        `https://ui-avatars.com/api/?name=${encodeURIComponent(product.title)}&background=94849&color=fff&bold=true`
    ];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [zoom, setZoom] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const nextImage = React.useCallback(() => setCurrentIndex((prev) => (prev + 1) % images.length), [images.length]);
    const prevImage = React.useCallback(() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length), [images.length]);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [nextImage, prevImage, onClose]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!zoom) return;
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setMousePos({ x, y });
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-8 select-none">
            {/* Close Button */}
            <button 
                onClick={onClose} 
                className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-50 p-2 bg-white/10 rounded-full hover:bg-white/20 border border-white/10"
            >
                <X size={24} />
            </button>
            
            <div className="relative w-full h-full max-w-6xl flex items-center justify-center">
                {/* Previous Button */}
                {images.length > 1 && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        className="absolute left-0 sm:-left-16 z-50 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md border border-white/20 group"
                        title="Previous (Left Arrow)"
                    >
                        <ChevronLeft size={32} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                )}

                {/* Main Image Container */}
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl bg-gray-900/50 shadow-2xl border border-white/5">
                    <div 
                        className="relative w-full h-full flex items-center justify-center cursor-zoom-in group"
                        onClick={() => setZoom(!zoom)}
                        onMouseMove={handleMouseMove}
                    >
                        <Image
                            unoptimized
                            src={images[currentIndex]}
                            alt={product.title}
                            fill
                            className={`object-contain transition-transform duration-500 ease-out ${zoom ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}`}
                        />
                        
                        {/* Zoom View */}
                        {zoom && (
                            <div 
                                className="absolute inset-0 z-10 bg-no-repeat pointer-events-none"
                                style={{
                                    backgroundImage: `url(${images[currentIndex]})`,
                                    backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
                                    backgroundSize: '250%',
                                }}
                            />
                        )}
                        
                        {!zoom && (
                            <div className="absolute bottom-4 right-4 bg-black/60 text-white px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md border border-white/10 translate-y-2 group-hover:translate-y-0">
                                <ZoomIn size={14} />
                                Click to Zoom
                            </div>
                        )}
                    </div>

                    {/* Thumbnails / Indicators */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-blue-500 w-10' : 'bg-white/20 hover:bg-white/40 w-4'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Next Button */}
                {images.length > 1 && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        className="absolute right-0 sm:-right-16 z-50 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md border border-white/20 group"
                        title="Next (Right Arrow)"
                    >
                        <ChevronRight size={32} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                )}
            </div>
            
            {/* Image Counter */}
            <div className="absolute bottom-6 left-6 text-white/50 text-sm font-medium">
                {currentIndex + 1} / {images.length}
            </div>
            
            {/* Product Title */}
            <div className="absolute top-6 left-6 text-white/90 text-lg font-semibold max-w-[calc(100%-100px)] truncate">
                {product.title}
            </div>
        </div>
    );
}
