"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addToCart } from "@/lib/action/cart.action";
import { toast } from "react-hot-toast";

export interface QuickViewProduct {
  id: number;
  name: string;
  price: number;
  discountedPrice?: number | null;
  description?: string;
  images: string[];
  isNew: boolean;
  inStock?: boolean;
  rating: number;
  reviews: number;
}

interface QuickViewModalProps {
  product: QuickViewProduct;
  onClose: () => void;
  isInWishlist?: boolean;
  onToggleWishlist?: () => void;
}

export default function QuickViewModal({
  product,
  onClose,
  isInWishlist = false,
  onToggleWishlist,
}: QuickViewModalProps) {
  console.log(product);

  const dispatch = useDispatch<AppDispatch>();

  const [activeIdx, setActiveIdx] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const [quantity, setQuantity] = useState(1);

  const images =
    product.images.length > 0
      ? product.images
      : ["/images/placeholder-product.jpg"];
  const inStock = product.inStock ?? true;

  const salePrice =
    product.discountedPrice && product.discountedPrice > 0 && product.discountedPrice < product.price
      ? product.discountedPrice
      : null;
  const displayPrice = salePrice ?? product.price;
  const salePercent =
    salePrice && product.price > 0
      ? Math.round((1 - salePrice / product.price) * 100)
      : null;

  // Close on ESC, lock body scroll
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleAddToCart = async () => {
    const result = await addToCart(product.id, quantity);
    if (result.success) {
      dispatch(
        addItemToCart({
          id: product.id,
          title: product.name,
          price: product.price,
          discountedPrice: salePrice ?? product.price,
          quantity,
          images,
        }),
      );
      toast.success("Added to cart");
    } else {
      toast.error(result.error ?? "Failed to add to cart");
    }
  };

  const whatsappMsg = encodeURIComponent(
    `Hi, I'm interested in: ${product.name} — PKR ${Number(displayPrice).toLocaleString()}`,
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1a251d] rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto no-scrollbar flex flex-col md:flex-row relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 size-9 bg-gray-100 dark:bg-[#2a3a2f] rounded-full flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-600 dark:text-white transition-colors"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* ── Left: Image gallery ── */}
        <div className="flex flex-row md:flex-col gap-2 p-4 md:w-[140px] overflow-x-auto md:overflow-y-auto no-scrollbar shrink-0">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`relative shrink-0 size-[80px] md:size-[90px] rounded-xl overflow-hidden border-2 transition-colors ${activeIdx === i
                  ? "border-primary"
                  : "border-transparent hover:border-gray-300"
                }`}
            >
              {!imgErrors[i] ? (
                <Image
                  src={src}
                  alt={`${product.name} ${i + 1}`}
                  fill
                  sizes="90px"
                  className="object-contain p-1"
                  onError={() => setImgErrors((p) => ({ ...p, [i]: true }))}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-[#2a3a2f]">
                  <span className="material-symbols-outlined text-2xl text-gray-300">
                    image_not_supported
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* ── Center: Main image ── */}
        <div className="relative flex-1 min-h-[300px] md:min-h-[420px] bg-[#f7f8f9] dark:bg-[#2a3a2f] flex items-center justify-center">
          {!imgErrors[activeIdx] ? (
            <Image
              src={images[activeIdx]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 500px"
              className="object-contain p-6"
              onError={() => setImgErrors((p) => ({ ...p, [activeIdx]: true }))}
            />
          ) : (
            <span className="material-symbols-outlined text-8xl text-gray-200 dark:text-white/10">
              image_not_supported
            </span>
          )}
        </div>

        {/* ── Right: Product info ── */}
        <div className="md:w-[500px] shrink-0 p-6 flex flex-col gap-4">
          {/* Sale badge */}
          {salePercent && (
            <span className="self-start bg-green-500 text-white text-xs font-bold px-3 py-1 rounded">
              SALE {salePercent}% OFF
            </span>
          )}

          {/* Name */}
          <h2 className="text-xl font-bold text-[#121714] dark:text-white leading-snug">
            {product.name}
          </h2>

          {/* Rating + stock */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`material-symbols-outlined text-[16px] ${i < product.rating
                      ? "text-yellow-400 fill-1"
                      : "text-gray-300"
                    }`}
                >
                  star
                </span>
              ))}
              <span className="text-sm text-gray-500 ml-1">
                {product.rating} Rating ({product.reviews} reviews)
              </span>
            </div>
            <span
              className={`flex items-center gap-1 text-sm font-medium ${inStock ? "text-green-600" : "text-red-500"}`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {inStock ? "check_circle" : "cancel"}
              </span>
              {inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
              {product.description}
            </p>
          )}

          {/* Price + Quantity */}
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">Price</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#121714] dark:text-white">
                  PKR{" "}
                  {Number(
                    product.discountedPrice ?? product.price,
                  ).toLocaleString()}
                </span>
                {salePrice && (
                  <span className="text-sm text-gray-400 line-through">
                    PKR {Number(product.price).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">Quantity</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="size-9 rounded-lg border border-gray-200 dark:border-[#3a4a3f] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#2a3a2f] transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    remove
                  </span>
                </button>
                <span className="w-10 text-center font-bold text-[#121714] dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="size-9 rounded-lg border border-gray-200 dark:border-[#3a4a3f] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#2a3a2f] transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    add
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 mt-1">
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className="w-full bg-[#1a1a2e] dark:bg-[#121714] text-white py-3 rounded-xl font-bold hover:bg-[#2a2a3e] dark:hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>

            <a
              href={`https://wa.me/?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              {/* WhatsApp SVG icon */}
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 fill-white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>

            <button
              onClick={onToggleWishlist}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${isInWishlist
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-[#1a2744] dark:bg-[#2a3a2f] text-white hover:bg-[#243060] dark:hover:bg-[#3a4a3f]"
                }`}
            >
              <span
                className={`material-symbols-outlined text-[18px] ${isInWishlist ? "fill-1" : ""}`}
              >
                favorite
              </span>
              {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            </button>
          </div>

          {/* View full details link */}
          <Link
            href={`/v2/product/${product.id}`}
            onClick={onClose}
            className="text-center text-sm text-primary font-semibold hover:underline mt-1"
          >
            View Full Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
