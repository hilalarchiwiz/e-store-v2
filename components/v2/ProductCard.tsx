"use client";

import { useState } from "react";
import Link from "next/link";
import { addToCart } from "@/lib/action/cart.action";
import {
  addToWishlist,
  removeFromWishlistByProductId,
} from "@/lib/action/wishlist.action";
import {
  addWishlistId,
  removeWishlistId,
} from "@/redux/features/wishlist-slice";
import { addItemToCart } from "@/redux/features/cart-slice";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import { toast } from "react-hot-toast";
import QuickViewModal from "@/components/v2/QuickViewModal";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  discountedPrice?: number;
  image: string;
  images?: string[];
  description?: string;
  category: string;
  rating: number;
  reviews: number;
  badge?: {
    text: string;
    variant: "primary" | "secondary";
  };
  layout?: "grid" | "list";
}

const formatPrice = (price: number) => {
  return `PKR ${price.toLocaleString()}`;
};

const StarRating = ({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "xs";
}) => (
  <div className="flex items-center gap-0.5 text-amber-400">
    {[...Array(5)].map((_, i) => (
      <span
        key={i}
        className={`material-symbols-outlined ${size === "xs" ? "text-xs!" : "text-sm!"} ${i < Math.floor(rating) ? "fill-1" : ""}`}
      >
        {i < Math.floor(rating) ? "star" : "star_border"}
      </span>
    ))}
  </div>
);

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  oldPrice,
  discountedPrice,
  image,
  images,
  description,
  category,
  rating,
  reviews,
  badge,
  layout = "grid",
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const wishlistIds = useAppSelector((state) => state.wishlistReducer.ids);
  const isWishlisted = wishlistIds.includes(id);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isWishlisted) {
      dispatch(removeWishlistId(id));
      await removeFromWishlistByProductId(id);
      toast.success("Removed from wishlist");
    } else {
      dispatch(addWishlistId(id));
      const result = await addToWishlist(id);
      if (!result.success) {
        dispatch(removeWishlistId(id));
        toast.error("Failed to add to wishlist");
      } else {
        toast.success("Added to Wishlist!");
      }
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    const result = await addToCart(id, 1);
    if (result.success) {
      dispatch(
        addItemToCart({
          id,
          title: name,
          price: oldPrice ?? price,
          discountedPrice: oldPrice ? price : undefined,
          quantity: 1,
          images: images && images.length > 0 ? images : [image],
        }),
      );
      toast.success("Added to Cart!");
    } else {
      toast.error(result.error ?? "Failed to add to Cart");
    }
  };

  const openQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  // Build QuickViewProduct — original price is oldPrice (if present), discounted is current price
  const quickViewProduct = {
    id,
    name,
    price: oldPrice ?? price,
    discountedPrice: oldPrice ? price : undefined,
    description,
    images: images && images.length > 0 ? images : [image],
    isNew: false,
    inStock: true,
    rating,
    reviews,
  };

  if (layout === "list") {
    return (
      <>
        <Link
          href={`/v2/product/${id}`}
          className="group bg-white dark:bg-[#1a251d] rounded-2xl border border-[#dce5df] dark:border-[#2a3a30] overflow-hidden flex flex-row shadow-sm hover:shadow-xl transition-all duration-300"
        >
          {/* Image */}
          <div className="relative w-40 shrink-0 overflow-hidden bg-[#f1f4f2] dark:bg-[#2a3a2f]">
            <img
              className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
              src={image}
              alt={name}
            />
            {badge && (
              <span
                className={`absolute top-2 left-2 ${badge.variant === "primary" ? "bg-primary" : "bg-[#121714]"} px-2 py-0.5 rounded text-white text-[9px] font-bold uppercase tracking-wide`}
              >
                {badge.text}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 p-5 flex flex-col sm:flex-row justify-between gap-4 min-w-0">
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-1.5">
                <StarRating rating={rating} size="xs" />
                <span className="text-xs text-[#648770] font-semibold">
                  ({reviews})
                </span>
              </div>
              <h3 className="font-bold text-base text-[#111713] dark:text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                {name}
              </h3>
              <p className="text-[#648770] text-xs font-medium">{category}</p>
            </div>

            <div className="flex flex-col items-end justify-between gap-3 shrink-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-extrabold text-[#111713] dark:text-white">
                  {formatPrice(price)}
                </span>
                {oldPrice && (
                  <span className="text-sm text-[#648770] line-through">
                    {formatPrice(oldPrice)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={openQuickView}
                  data-no-progress
                  title="Quick View"
                  className="p-2 rounded-xl flex items-center border border-[#dce5df] dark:border-[#2a3a30] text-[#648770] hover:text-primary hover:border-primary transition-all"
                >
                  <span className="material-symbols-outlined text-lg">
                    visibility
                  </span>
                </button>
                <button
                  onClick={handleAddToWishlist}
                  title={
                    isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                  }
                  className={`p-2 rounded-xl flex items-center border transition-all hover:scale-105 active:scale-95 ${isWishlisted ? "border-red-200 bg-red-50 text-red-500 dark:border-red-800 dark:bg-red-950/20" : "border-[#dce5df] dark:border-[#2a3a30] text-[#648770] hover:text-red-500 hover:border-red-200"}`}
                >
                  <span
                    className={`material-symbols-outlined text-lg ${isWishlisted ? "fill-1" : ""}`}
                  >
                    favorite
                  </span>
                </button>
                <button
                  onClick={handleAddToCart}
                  className="bg-primary text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 hover:bg-primary/90 transition-all shadow-sm active:scale-95 text-sm whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-sm">
                    add_shopping_cart
                  </span>
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </Link>

        {quickViewOpen && (
          <QuickViewModal
            product={quickViewProduct}
            onClose={() => setQuickViewOpen(false)}
            isInWishlist={isWishlisted}
            onToggleWishlist={() => {
              dispatch(isWishlisted ? removeWishlistId(id) : addWishlistId(id));
              if (isWishlisted) removeFromWishlistByProductId(id);
              else addToWishlist(id);
            }}
          />
        )}
      </>
    );
  }

  // Grid layout (default)
  return (
    <>
      <Link
        href={`/v2/product/${id}`}
        className="group bg-white dark:bg-[#1a251d] rounded-2xl border border-[#dce5df] dark:border-[#2a3a30] overflow-hidden flex flex-col shadow-sm hover:shadow-xl transition-all duration-300"
      >
        <div className="relative h-64 overflow-hidden bg-[#f1f4f2] dark:bg-[#2a3a2f]">
          <img
            className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
            src={image}
            alt={name}
          />
          {/* Wishlist */}
          <button
            className={`absolute top-4 flex items-center right-4 p-2 rounded-full backdrop-blur-sm transition-all hover:scale-110 active:scale-95 ${isWishlisted ? "bg-red-50 text-red-500" : "bg-white/80 text-[#648770] hover:text-red-500 hover:bg-white"}`}
            onClick={handleAddToWishlist}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <span
              className={`material-symbols-outlined text-lg ${isWishlisted ? "fill-1" : ""}`}
            >
              favorite
            </span>
          </button>

          {/* Quick View — appears on hover */}
          <button
            onClick={openQuickView}
            data-no-progress
            title="Quick View"
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-[#1a251d] text-[#111713] dark:text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 whitespace-nowrap border border-gray-100 dark:border-white/10 hover:bg-primary hover:text-white hover:border-primary"
          >
            <span className="material-symbols-outlined text-[16px]">
              visibility
            </span>
            Quick View
          </button>

          {badge && (
            <div className="absolute bottom-4 left-4">
              <span
                className={`${badge.variant === "primary" ? "bg-primary" : "bg-[#121714]"} px-3 py-1 rounded-lg text-white text-[10px] font-bold uppercase tracking-wide shadow-md`}
              >
                {badge.text}
              </span>
            </div>
          )}
        </div>
        <div className="p-5 flex flex-col flex-1 gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <StarRating rating={rating} />
              <span className="text-xs text-[#648770] ml-1 font-semibold">
                ({reviews})
              </span>
            </div>
            <h3 className="text-[#111713] dark:text-white font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {name}
            </h3>
            <p className="text-[#648770] text-sm font-medium">{category}</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-[#111713] dark:text-white">
              {formatPrice(price)}
            </span>
            {oldPrice && (
              <span className="text-sm text-[#648770] line-through">
                {formatPrice(oldPrice)}
              </span>
            )}
          </div>
          <button
            className="w-full bg-primary text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-sm active:scale-95"
            onClick={handleAddToCart}
          >
            <span className="material-symbols-outlined text-sm">
              add_shopping_cart
            </span>
            Add to Cart
          </button>
        </div>
      </Link>

      {quickViewOpen && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewOpen(false)}
          isInWishlist={isWishlisted}
          onToggleWishlist={() => {
            dispatch(isWishlisted ? removeWishlistId(id) : addWishlistId(id));
            if (isWishlisted) removeFromWishlistByProductId(id);
            else addToWishlist(id);
          }}
        />
      )}
    </>
  );
};

export default ProductCard;
