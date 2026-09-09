"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addToCart, getProductStock } from "@/lib/action/cart.action";
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
  wishlistLoading?: boolean;
}

export default function QuickViewModal({
  product,
  onClose,
  isInWishlist = false,
  onToggleWishlist,
  wishlistLoading = false,
}: QuickViewModalProps) {
  const dispatch = useDispatch<AppDispatch>();

  const [activeIdx, setActiveIdx] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [quantity, setQuantity] = useState(1);
  const [maxQty, setMaxQty] = useState<number>(1);
  const [stockLoaded, setStockLoaded] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartLimitReached, setCartLimitReached] = useState(false);
  const cartRequestPending = useRef(false);
  const thumbnailTrack = useRef<HTMLDivElement>(null);

  const images =
    product.images.length > 0
      ? product.images
      : ["/images/placeholder-product.jpg"];
  const inStock = product.inStock ?? true;
  const stockAvailable = inStock && (!stockLoaded || maxQty > 0);
  const cartDisabled = cartLoading || !stockAvailable || cartLimitReached;

  const salePrice =
    product.discountedPrice &&
    product.discountedPrice > 0 &&
    product.discountedPrice < product.price
      ? product.discountedPrice
      : null;
  const displayPrice = salePrice ?? product.price;
  const salePercent =
    salePrice && product.price > 0
      ? Math.round((1 - salePrice / product.price) * 100)
      : null;

  // Center the selection within the strip to reveal neighboring images.
  useEffect(() => {
    const track = thumbnailTrack.current;
    if (!track) return;
    const centerThumbnail = () => {
      const thumbnail = track.children[activeIdx] as HTMLElement | undefined;
      if (!thumbnail) return;
      const trackBounds = track.getBoundingClientRect();
      const thumbnailBounds = thumbnail.getBoundingClientRect();
      track.scrollTo({
        left: track.scrollLeft + thumbnailBounds.left - trackBounds.left
          - (track.clientWidth - thumbnailBounds.width) / 2,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      });
    };
    centerThumbnail();
    const observer = new ResizeObserver(centerThumbnail);
    observer.observe(track);
    return () => observer.disconnect();
  }, [activeIdx]);

  // Fetch real stock quantity when modal opens
  useEffect(() => {
    let cancelled = false;
    getProductStock(product.id).then((stock) => {
      if (!cancelled) {
        setMaxQty(stock);
        setStockLoaded(true);
        // Clamp current quantity if needed
        setQuantity((q) => (stock > 0 ? Math.min(q, stock) : 1));
      }
    });
    return () => { cancelled = true; };
  }, [product.id]);

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
    if (cartDisabled || cartRequestPending.current) return;

    cartRequestPending.current = true;
    setCartLoading(true);
    try {
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
        // Parse stock limit from errors such as
        // "Only 3 more units available (stock: 3)".
        const stockMatch = result.error?.match(/stock:\s*(\d+)/);
        const availableMatch = result.error?.match(/Only (\d+) more/);
        if (/out of stock/i.test(result.error ?? "")) {
          setMaxQty(0);
        } else if (/maximum available stock/i.test(result.error ?? "")) {
          setCartLimitReached(true);
        } else if (stockMatch) {
          const stockLimit = parseInt(stockMatch[1]);
          setMaxQty(stockLimit);
          setQuantity((q) => Math.min(q, stockLimit));
        } else if (availableMatch) {
          const alreadyInCart = quantity - parseInt(availableMatch[1]);
          setMaxQty(alreadyInCart > 0 ? alreadyInCart : 1);
        }
        toast.error(result.error ?? "Failed to add to cart");
      }
    } finally {
      cartRequestPending.current = false;
      setCartLoading(false);
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
        className="bg-surface dark:bg-surface rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90dvh] overflow-y-auto overscroll-contain no-scrollbar grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-10 lg:gap-16 p-5 pt-16 sm:p-8 sm:pt-16 md:p-10 md:pt-16 lg:p-12 lg:pt-16 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 size-10 sm:size-11 bg-icon-surface dark:bg-icon-surface rounded-full flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 text-muted dark:text-white transition-colors"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Image gallery: main image with thumbnails below */}
        <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-surface dark:bg-surface flex items-center justify-center">
            {salePercent && (
              <span className="absolute top-3 left-3 z-10 flex size-16 flex-col items-center justify-center rounded-full bg-green-500 text-white text-[10px] font-bold leading-tight text-center">
                <span className="text-sm">SALE</span>
                {salePercent}% OFF
              </span>
            )}
            {!loadedImages[images[activeIdx]] && !imgErrors[activeIdx] && (
              <div
                className="absolute inset-0 z-[1] flex flex-col items-center justify-center gap-3 bg-surface text-muted dark:bg-surface dark:text-muted"
                role="status"
                aria-live="polite"
              >
                <span
                  aria-hidden="true"
                  className="size-8 animate-spin rounded-full border-2 border-outline border-t-primary motion-reduce:animate-none"
                />
                <span className="text-xs font-medium">Loading image…</span>
              </div>
            )}
            {!imgErrors[activeIdx] ? (
              <Image
                src={images[activeIdx]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 90vw, 440px"
                className="object-contain p-6"
                onLoad={() =>
                  setLoadedImages((loaded) => ({
                    ...loaded,
                    [images[activeIdx]]: true,
                  }))
                }
                onError={() => setImgErrors((p) => ({ ...p, [activeIdx]: true }))}
              />
            ) : (
              <span className="material-symbols-outlined text-8xl text-gray-200 dark:text-white/10">
                image_not_supported
              </span>
            )}
          </div>

          <div ref={thumbnailTrack} role="group" aria-label="Product images" className="flex gap-3 sm:gap-5 overflow-x-auto overscroll-x-contain pb-1 no-scrollbar">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                aria-label={`View product image ${i + 1}`}
                aria-pressed={activeIdx === i}
                className={`relative shrink-0 w-[calc((100%_-_1.5rem)/3)] sm:w-[calc((100%_-_2.5rem)/3)] aspect-square bg-surface dark:bg-surface rounded-lg overflow-hidden border-2 transition-colors ${
                  activeIdx === i
                    ? "border-primary"
                    : "border-transparent hover:border-outline"
                }`}
              >
                {!loadedImages[src] && !imgErrors[i] && (
                  <span
                    aria-hidden="true"
                    className="absolute left-1/2 top-1/2 z-[1] size-5 -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full border-2 border-outline border-t-primary motion-reduce:animate-none"
                  />
                )}
                {!imgErrors[i] ? (
                  <Image
                    src={src}
                    alt={`${product.name} ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 28vw, 130px"
                    className="object-contain p-1"
                    onLoad={() =>
                      setLoadedImages((loaded) => ({ ...loaded, [src]: true }))
                    }
                    onError={() => setImgErrors((p) => ({ ...p, [i]: true }))}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-surface dark:bg-surface">
                    <span className="material-symbols-outlined text-2xl text-gray-300">
                      image_not_supported
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
          {images.length > 1 && (
            <div className="flex items-center justify-between gap-3">
              <p aria-live="polite" aria-atomic="true" className="text-xs font-medium text-muted dark:text-muted">
                Image {activeIdx + 1} of {images.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveIdx((index) => Math.max(0, index - 1))}
                  disabled={activeIdx === 0}
                  aria-label="Previous product image"
                  className="flex size-9 items-center justify-center rounded-full border border-outline text-muted transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30 dark:border-outline dark:text-white"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-xl">chevron_left</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIdx((index) => Math.min(images.length - 1, index + 1))}
                  disabled={activeIdx === images.length - 1}
                  aria-label="Next product image"
                  className="flex size-9 items-center justify-center rounded-full border border-outline text-muted transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30 dark:border-outline dark:text-white"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-xl">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Product info ── */}
        <div className="min-w-0 flex flex-col gap-5 md:py-1">
          {/* Name */}
          <h2 className="text-xl sm:text-2xl font-bold text-foreground dark:text-foreground leading-snug break-words">
            {product.name}
          </h2>

          {/* Rating + stock */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`material-symbols-outlined text-[16px] ${
                    i < product.rating
                      ? "text-yellow-400 fill-1"
                      : "text-gray-300"
                  }`}
                >
                  star
                </span>
              ))}
              <span className="text-sm text-muted ml-1">
                {product.rating} Rating ({product.reviews} reviews)
              </span>
            </div>
            <span
              className={`flex items-center gap-1 text-sm font-medium ${stockAvailable ? "text-green-600" : "text-red-500"}`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {stockAvailable ? "check_circle" : "cancel"}
              </span>
              {stockAvailable ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          {/* Price + Quantity */}
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs text-muted font-medium mb-1">Price</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-foreground dark:text-foreground">
                  PKR{" "}
                  {Number(
                    product.discountedPrice ?? product.price,
                  ).toLocaleString()}
                </span>
                {salePrice && (
                  <span className="text-sm text-muted line-through">
                    PKR {Number(product.price).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs text-muted font-medium mb-1">Quantity</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={!stockAvailable || quantity <= 1}
                  className="size-9 rounded-lg border border-outline dark:border-outline flex items-center justify-center hover:bg-icon-surface dark:hover:bg-icon-surface transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    remove
                  </span>
                </button>
                <span className="w-10 text-center font-bold text-foreground dark:text-foreground">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  disabled={!stockLoaded || !stockAvailable || quantity >= maxQty}
                  className="size-9 rounded-lg border border-outline dark:border-outline flex items-center justify-center hover:bg-icon-surface dark:hover:bg-icon-surface transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    add
                  </span>
                </button>
              </div>
              {stockLoaded && maxQty > 0 && (
                <p className="text-[10px] text-muted mt-1">{maxQty} in stock</p>
              )}
              {stockLoaded && maxQty <= 0 && (
                <p className="text-[10px] text-red-400 font-bold mt-1">Out of stock</p>
              )}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm leading-relaxed text-muted dark:text-muted line-clamp-3">
              {product.description}
            </p>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
            <button
              onClick={handleAddToCart}
              disabled={cartDisabled}
              aria-busy={cartLoading}
              className="flex w-full sm:col-span-2 items-center justify-center gap-2 rounded-full bg-primary py-3 font-bold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-muted"
            >
              {cartLoading && (
                <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {cartLoading
                ? "Adding..."
                : !stockAvailable
                  ? "Out of Stock"
                  : cartLimitReached
                    ? "Limit Reached"
                    : "Add to Cart"}
            </button>

            <a
              href={`https://wa.me/?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-500 text-white py-3 px-3 rounded-full text-sm font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
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
              disabled={wishlistLoading}
              aria-busy={wishlistLoading}
              className={`w-full py-3 px-3 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:cursor-wait disabled:opacity-70 ${
                isInWishlist
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-icon-surface text-foreground hover:bg-primary/10"
              }`}
            >
              {wishlistLoading ? (
                <span className="size-[18px] animate-spin rounded-full border-2 border-current/30 border-t-current" />
              ) : (
                <span
                  className={`material-symbols-outlined text-[18px] ${isInWishlist ? "fill-1" : ""}`}
                >
                  favorite
                </span>
              )}
              {wishlistLoading
                ? "Updating..."
                : isInWishlist
                  ? "Remove from Wishlist"
                  : "Add to Wishlist"}
            </button>
          </div>

          {/* View full details link */}
          <Link
            href={`/product/${product.id}`}
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
