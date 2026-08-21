"use client";

import { useRef, useState } from "react";
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
import { Heart } from "lucide-react";
import { useHydrated } from "@/hooks/useHydrated";

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
  quantity?: number;
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
  <div className="flex items-center gap-0 text-[#f5a400]">
    {[...Array(5)].map((_, i) => (
      <span
        key={i}
        className={`material-symbols-outlined ${size === "xs" ? "text-xs!" : "text-[16px]!"} ${i < Math.floor(rating) ? "fill-1" : ""}`}
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
  quantity,
  badge,
  layout = "grid",
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const wishlistIds = useAppSelector((state) => state.wishlistReducer.ids);
  const hydrated = useHydrated();
  const isWishlisted = hydrated && wishlistIds.includes(id);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartLimitReached, setCartLimitReached] = useState(false);
  const wishlistRequestPending = useRef(false);
  const cartRequestPending = useRef(false);
  const isOutOfStock = quantity !== undefined && quantity <= 0;
  const cartDisabled = isOutOfStock || cartLimitReached || cartLoading;

  const toggleWishlist = async () => {
    if (wishlistRequestPending.current) return;

    const wasWishlisted = isWishlisted;
    wishlistRequestPending.current = true;
    setWishlistLoading(true);

    try {
      if (wasWishlisted) {
        dispatch(removeWishlistId(id));
        const result = await removeFromWishlistByProductId(id);

        if (result.success) {
          toast.success("Removed from wishlist");
        } else {
          dispatch(addWishlistId(id));
          toast.error(result.error ?? "Failed to update wishlist");
        }
      } else {
        dispatch(addWishlistId(id));
        const result = await addToWishlist(id);

        if (result.success) {
          toast.success("Added to Wishlist!");
        } else {
          dispatch(removeWishlistId(id));
          toast.error(result.error ?? "Failed to update wishlist");
        }
      }
    } finally {
      wishlistRequestPending.current = false;
      setWishlistLoading(false);
    }
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    void toggleWishlist();
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartDisabled || cartRequestPending.current) return;

    cartRequestPending.current = true;
    setCartLoading(true);
    try {
      const result = await addToCart(id, 1);
      if (result.success) {
        dispatch(
          addItemToCart({
            id,
            title: name,
            price: oldPrice ?? price,
            discountedPrice: oldPrice ? price : price,
            quantity: 1,
            images: images && images.length > 0 ? images : [image],
          }),
        );
        toast.success("Added to Cart!");
      } else {
        if (
          /out of stock|maximum available stock|only 0 more/i.test(
            result.error ?? "",
          )
        ) {
          setCartLimitReached(true);
        }
        toast.error(result.error ?? "Failed to add to Cart");
      }
    } finally {
      cartRequestPending.current = false;
      setCartLoading(false);
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
    inStock: !isOutOfStock,
    rating,
    reviews,
  };

  if (layout === "list") {
    return (
      <>
        <Link
          href={`/product/${id}`}
          className="group bg-white dark:bg-[#1a251d] rounded-2xl border border-[#dce5df] dark:border-[#2a3a30] overflow-hidden flex flex-row shadow-sm hover:shadow-xl transition-all duration-300"
        >
          {/* Image */}
          <div className="relative w-40 shrink-0 overflow-hidden bg-[#f1f4f2] dark:bg-[#2a3a2f]">
            {imageError ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-[#8a9990]">
                <span className="material-symbols-outlined text-3xl">
                  image_not_supported
                </span>
                <span className="text-[10px] font-medium">Image unavailable</span>
              </div>
            ) : (
              <img
                className="h-full w-full object-contain  transition-transform duration-500 group-hover:scale-105"
                src={image}
                alt={name}
                onError={() => setImageError(true)}
              />
            )}
            {badge && (
              <span
                className={`absolute top-2 left-2 ${badge.variant === "primary" ? "bg-primary" : "bg-[#121714]"} px-2 py-0.5 rounded text-white text-[9px] font-bold capitalize tracking-wide`}
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
                  disabled={wishlistLoading}
                  aria-busy={wishlistLoading}
                  title={
                    isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                  }
                  className={`p-2 rounded-xl flex items-center border transition-all hover:scale-105 active:scale-95 disabled:cursor-wait disabled:scale-100 disabled:opacity-70 ${isWishlisted ? "border-primary/30 bg-primary/5 text-primary" : "border-[#dce5df] dark:border-[#2a3a30] text-[#648770] hover:text-primary hover:border-primary/30"}`}
                >
                  {wishlistLoading ? (
                    <span className="size-[18px] animate-spin rounded-full border-2 border-current/30 border-t-current" />
                  ) : (
                    <Heart
                      size={18}
                      strokeWidth={1.8}
                      className={isWishlisted ? "fill-current" : ""}
                    />
                  )}
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={cartDisabled}
                  aria-busy={cartLoading}
                  className="flex min-w-32 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:bg-[#9aa69e] disabled:active:scale-100"
                >
                  {cartLoading ? (
                    <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : (
                    <span className="material-symbols-outlined text-sm">
                      {isOutOfStock || cartLimitReached
                        ? "remove_shopping_cart"
                        : "add_shopping_cart"}
                    </span>
                  )}
                  {cartLoading
                    ? "Adding..."
                    : isOutOfStock
                      ? "Out of Stock"
                      : cartLimitReached
                        ? "Limit Reached"
                        : "Add to Cart"}
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
            wishlistLoading={wishlistLoading}
            onToggleWishlist={() => void toggleWishlist()}
          />
        )}
      </>
    );
  }

  // Grid layout (default)
  return (
    <>
      <Link
        href={`/product/${id}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#d9e3dd] bg-white shadow-[0_2px_7px_rgba(18,23,20,0.10)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_12px_30px_rgba(18,23,20,0.14)] dark:border-[#2a3a30] dark:bg-[#1a251d]"
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#f1f5f3] dark:bg-[#243129]">
          {imageError ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#87958c] dark:text-[#9aa89f]">
              <span className="material-symbols-outlined text-4xl sm:text-5xl">
                image_not_supported
              </span>
              <span className="text-[10px] font-medium sm:text-xs">
                Image unavailable
              </span>
            </div>
          ) : (
            <img
              className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.045]"
              src={image}
              alt={name}
              onError={() => setImageError(true)}
            />
          )}
          {/* Wishlist */}
          <button
            type="button"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            disabled={wishlistLoading}
            aria-busy={wishlistLoading}
            className={`absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 disabled:cursor-wait disabled:scale-100 disabled:opacity-70 ${isWishlisted ? "text-primary" : "text-[#717b74] hover:bg-white/70 hover:text-primary dark:text-[#a9b2ac] dark:hover:bg-black/20"}`}
            onClick={handleAddToWishlist}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            {wishlistLoading ? (
              <span className="size-5 animate-spin rounded-full border-2 border-current/30 border-t-current" />
            ) : (
              <Heart
                size={21}
                strokeWidth={2}
                className={isWishlisted ? "fill-current" : ""}
              />
            )}
          </button>

          {/* Quick View — visible on mobile, hover on desktop */}
          <button
            onClick={openQuickView}
            data-no-progress
            title="Quick View"
            className="absolute bottom-3 left-1/2 hidden translate-y-2 -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-gray-100 bg-white px-3 py-1.5 text-[11px] font-bold text-[#111713] opacity-0 shadow-lg transition-all duration-300 hover:border-primary hover:bg-primary hover:text-white group-hover:translate-y-0 group-hover:opacity-100 dark:border-white/10 dark:bg-[#1a251d] dark:text-white sm:flex"
          >
            <span className="material-symbols-outlined text-[16px]">
              visibility
            </span>
            Quick View
          </button>

          {badge && (
            <div className="absolute bottom-3 left-3">
              <span
                className={`${badge.variant === "primary" ? "bg-primary" : "bg-[#121714]"} px-3 py-1 rounded-lg text-white text-[10px] font-bold capitalize tracking-wide shadow-md`}
              >
                {badge.text}
              </span>
            </div>
          )}
        </div>
        <div className="flex min-h-44 flex-1 flex-col p-3 sm:min-h-48 sm:p-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex min-w-0 items-center">
              <StarRating rating={rating} />
              <span className="ml-2 text-[11px] font-medium text-[#648770] sm:text-xs">
                ({reviews})
              </span>
            </div>

            <h3 className="line-clamp-2 min-h-8 font-['Inter'] text-sm font-semibold leading-[1.25] text-black transition-colors group-hover:text-primary dark:text-white sm:min-h-9 sm:text-[15px]">
              {name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()}
            </h3>
            <p className="truncate text-xs font-medium text-[#648770]">
              {category}
            </p>
          </div>

          <div className="mt-auto flex items-baseline gap-2 pt-3">
            <span className="text-base font-semibold tracking-tight text-black dark:text-white sm:text-lg">
              {formatPrice(price)}
            </span>
            {oldPrice && (
              <span className="hidden text-xs text-[#7a8980] line-through sm:inline">
                {formatPrice(oldPrice)}
              </span>
            )}
          </div>
          <button
            type="button"
            disabled={cartDisabled}
            aria-busy={cartLoading}
            className="mt-3 flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-primary bg-white px-2 font-['Inter'] text-xs font-medium text-primary shadow-[0_2px_4px_rgba(27,151,75,0.08)] transition-all hover:bg-primary hover:text-white hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:border-[#aeb8b1] disabled:bg-[#eef1ef] disabled:text-[#7a877f] disabled:shadow-none disabled:active:scale-100 dark:bg-transparent dark:disabled:bg-white/5 sm:text-sm"
            onClick={handleAddToCart}
          >
            {cartLoading ? (
              <span className="size-4 animate-spin rounded-full border-2 border-current/30 border-t-current sm:size-5" />
            ) : (
              <span className="material-symbols-outlined text-[19px]">
                {isOutOfStock || cartLimitReached
                  ? "remove_shopping_cart"
                  : "add_shopping_cart"}
              </span>
            )}
            {cartLoading
              ? "Adding..."
              : isOutOfStock
                ? "Out of Stock"
                : cartLimitReached
                  ? "Limit Reached"
                  : "Add to Cart"}
          </button>
        </div>
      </Link>

      {quickViewOpen && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewOpen(false)}
          isInWishlist={isWishlisted}
          wishlistLoading={wishlistLoading}
          onToggleWishlist={() => void toggleWishlist()}
        />
      )}
    </>
  );
};

export default ProductCard;
