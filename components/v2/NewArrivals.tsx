"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "@/hooks/useWishlist";
import QuickViewModal from "./QuickViewModal";

interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  discountedPrice?: number | null;
  description?: string;
  image: string;
  images: string[];
  inStock?: boolean;
  isNew: boolean;
  rating: number;
  reviews: number;
}

interface NewArrivalsProps {
  products: Product[];
}

const NewArrivals: React.FC<NewArrivalsProps> = ({ products = [] }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  const openQuickView = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewProduct({
      ...product,
      price: product.oldPrice ?? product.price,
      discountedPrice: product.oldPrice ? product.price : undefined,
    });
  };

  return (
    <>
      <section className="px-6 py-10 bg-[#f1f4f2] dark:bg-[#1a251d] rounded-[2rem] mx-6">
        <div className="max-w-[1100px] mx-auto">
          {/* Header */}
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">
                Just Arrived
              </p>
              <h2 className="text-3xl font-black tracking-tight text-[#121714] dark:text-white">
                New Arrivals
              </h2>
              <div className="w-12 h-0.75 bg-primary rounded-full mt-3" />
            </div>
            <Link
              href="/shop"
              className="text-primary font-bold flex items-center gap-1 group text-sm"
            >
              Explore More
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </Link>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.slice(0, 6).map((product, idx) => (
              <Link
                key={product.id}
                href={`/v2/product/${product.id}`}
                className="bg-white dark:bg-[#2a3a2f] p-4 rounded-2xl group relative shadow-sm hover:shadow-xl transition-all duration-300 block"
              >
                {/* Image container */}
                <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-[#f9fafb] dark:bg-[#1a251d]">
                  {!imgErrors[product.id] ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-contain transition-transform duration-500 group-hover:scale-105"
                      priority={idx < 3}
                      onError={() =>
                        setImgErrors((prev) => ({ ...prev, [product.id]: true }))
                      }
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-6xl text-[#121714]/15 dark:text-white/15">
                        image_not_supported
                      </span>
                    </div>
                  )}

                  {/* NEW badge */}
                  {product.isNew && (
                    <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded z-10">
                      NEW
                    </span>
                  )}

                  {/* Action buttons — top right */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                    {/* Heart / Wishlist */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(product.id);
                      }}
                      title={
                        isInWishlist(product.id)
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                      className={`size-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${isInWishlist(product.id)
                        ? "bg-red-500 text-white scale-100 opacity-100"
                        : "bg-white/90 dark:bg-[#2a3a2f]/90 text-[#121714] dark:text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white"
                        }`}
                    >
                      <span
                        className={`material-symbols-outlined text-sm ${isInWishlist(product.id) ? "fill-1" : ""
                          }`}
                      >
                        favorite
                      </span>
                    </button>

                    {/* Eye / Quick View */}
                    <button
                      onClick={(e) => openQuickView(e, product)}
                      title="Quick view"
                      className="size-9 bg-white/90 dark:bg-[#2a3a2f]/90 text-[#121714] dark:text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm hover:bg-primary hover:text-white"
                    >
                      <span className="material-symbols-outlined text-sm">
                        visibility
                      </span>
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-col gap-1">
                  {product.rating > 0 && (
                    <div className="flex items-center gap-1 text-yellow-500 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`material-symbols-outlined text-sm ${i < product.rating ? "fill-1" : ""
                            }`}
                        >
                          star
                        </span>
                      ))}
                      {product.reviews > 0 && (
                        <span className="text-xs text-gray-500 font-medium ml-1">
                          ({product.reviews})
                        </span>
                      )}
                    </div>
                  )}
                  <h4 className="font-bold text-[#121714] dark:text-white group-hover:text-primary transition-colors leading-snug line-clamp-2">
                    {product.name}
                  </h4>
                  <div className="flex items-baseline gap-2">
                    <p className="text-primary font-black text-lg">
                      PKR {product.price.toLocaleString()}
                    </p>
                    {product.oldPrice && (
                      <p className="text-xs text-gray-400 line-through">
                        PKR {product.oldPrice.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          isInWishlist={isInWishlist(quickViewProduct.id)}
          onToggleWishlist={() => toggleWishlist(quickViewProduct.id)}
        />
      )}
    </>
  );
};

export default NewArrivals;
