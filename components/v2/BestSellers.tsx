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
  soldCount: number;
}

interface BestSellersProps {
  products: Product[];
}

const BestSellers: React.FC<BestSellersProps> = ({ products = [] }) => {
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
      <section className="px-6 py-12">
        {/* Header */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">
              Top Picks
            </p>
            <h2 className="text-3xl font-black tracking-tight text-[#121714] dark:text-white">
              Best Sellers
            </h2>
            <div className="w-12 h-0.75 bg-primary rounded-full mt-3" />
          </div>
          <Link
            href="/shop"
            className="text-primary font-bold flex items-center gap-1 group text-sm"
          >
            View All
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </Link>
        </div>

        {/* Grid — 4 cols desktop, 3 tablet, 2 mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.slice(0, 12).map((product, idx) => {

            return (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="bg-white dark:bg-[#2a3a2f] rounded-2xl group relative shadow-sm hover:shadow-xl transition-all duration-300 block overflow-hidden"
              >
                {/* Image */}
                <div className="relative aspect-square bg-[#f1f4f2] dark:bg-[#1a251d] overflow-hidden">
                  {!imgErrors[product.id] ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                      priority={idx < 4}
                      onError={() =>
                        setImgErrors((prev) => ({ ...prev, [product.id]: true }))
                      }
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-5xl text-[#121714]/15 dark:text-white/15">
                        image_not_supported
                      </span>
                    </div>
                  )}

                  {/* Sale badge */}
                  {product.oldPrice && (
                    <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded z-10">
                      -{Math.round((1 - product.price / product.oldPrice) * 100)}%
                    </span>
                  )}

                  {/* Top-right action buttons */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
                    {/* Wishlist */}
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
                      className={`size-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${isInWishlist(product.id)
                        ? "bg-red-500 text-white opacity-100"
                        : "bg-white/90 dark:bg-[#2a3a2f]/90 text-[#121714] dark:text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white"
                        }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[16px] ${isInWishlist(product.id) ? "fill-1" : ""
                          }`}
                      >
                        favorite
                      </span>
                    </button>

                    {/* Quick view */}
                    <button
                      onClick={(e) => openQuickView(e, product)}
                      title="Quick view"
                      className="size-8 bg-white/90 dark:bg-[#2a3a2f]/90 text-[#121714] dark:text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm hover:bg-primary hover:text-white"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        visibility
                      </span>
                    </button>
                  </div>

                  {/* Slide-up "View Product" bar */}
                  <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex items-center justify-center gap-2 bg-primary text-white py-2.5 text-sm font-bold w-full pointer-events-none">
                      <span className="material-symbols-outlined text-[16px]">
                        shopping_bag
                      </span>
                      View Product
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 flex flex-col gap-1">
                  {/* Stars + sold */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`material-symbols-outlined text-[13px] ${i < product.rating ? "fill-1" : ""
                            }`}
                        >
                          star
                        </span>
                      ))}
                    </div>
                    <span className="text-[11px] text-[#121714]/40 dark:text-white/40 font-medium">
                      {product.soldCount}+ sold
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-[#121714] dark:text-white group-hover:text-primary transition-colors leading-snug line-clamp-2">
                    {product.name}
                  </h4>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-primary font-black text-base">
                      PKR {Number(product.price).toLocaleString()}
                    </span>
                    {product.oldPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        PKR {Number(product.oldPrice).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
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

export default BestSellers;
