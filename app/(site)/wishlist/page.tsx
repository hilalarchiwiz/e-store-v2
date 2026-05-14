"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Breadcrumbs from "@/components/v2/Breadcrumbs";
import Button from "@/components/v2/Button";
import { getWishlist } from "@/lib/action/wishlist.action";
import { removeFromWishlistByProductId } from "@/lib/action/wishlist.action";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { removeWishlistId } from "@/redux/features/wishlist-slice";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addToCart } from "@/lib/action/cart.action";
import { toast } from "react-hot-toast";
import { discountPrice } from "@/lib/helper";

type WishlistItem = Awaited<ReturnType<typeof getWishlist>>[number];

const WishlistPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    getWishlist().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const handleRemove = useCallback(
    async (productId: number) => {
      setRemovingId(productId);
      // Optimistic
      setItems((prev) => prev.filter((i) => i.productId !== productId));
      dispatch(removeWishlistId(productId));

      const result = await removeFromWishlistByProductId(productId);
      if (!result.success) {
        toast.error("Failed to remove");
        // Re-fetch to restore
        getWishlist().then(setItems);
      } else {
        toast.error("Removed from wishlist");
      }
      setRemovingId(null);
    },
    [dispatch],
  );

  const handleAddToCart = useCallback(
    async (item: WishlistItem) => {
      const result = await addToCart(item.product.id, 1);
      if (result.success) {
        dispatch(
          addItemToCart({
            id: item.product.id,
            title: item.product.title,
            price: item.product.price,
            discountedPrice: item.product.discountedPrice ?? item.product.price,
            quantity: 1,
            images: item.product.images,
          }),
        );
        toast.success("Added to cart");
      } else {
        toast.error("Failed to add to cart");
      }
    },
    [dispatch],
  );

  return (
    <main className="max-w-[1200px] mx-auto w-full px-6 py-10 md:py-16 flex flex-col gap-10">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "My Wishlist" }]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#dce5df] dark:border-[#2a3a30]">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-3xl fill-1">
              favorite
            </span>
          </div>
          <div>
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-0.5">
              Saved Items
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-[#121714] dark:text-white leading-tight">
              My Wishlist
            </h1>
          </div>
        </div>
        {!loading && items.length > 0 && (
          <span className="self-start sm:self-auto inline-flex items-center gap-1.5 bg-primary/10 text-primary text-sm font-bold px-4 py-2 rounded-full">
            <span className="material-symbols-outlined text-base">
              inventory_2
            </span>
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#1a251d] border border-[#dce5df] dark:border-[#2a3a30] rounded-2xl p-4 h-28 animate-pulse"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 flex flex-col items-center text-center bg-white dark:bg-[#1a251d] rounded-3xl border border-primary/5 shadow-xl">
          <div className="size-32 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-8 animate-bounce">
            <span className="material-symbols-outlined !text-6xl">
              favorite
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[#121714] dark:text-white mb-2">
            No favorites yet
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-10 leading-relaxed px-6">
            Tap the heart icon on any product to save it here.
          </p>
          <Button variant="primary" icon="explore">
            <Link href="/shop">Start Exploring</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => {
            const product = item.product;
            const inStock = product.quantity > 0;
            const finalPrice =
              product.discountedPrice && product.discountedPrice > 0
                ? discountPrice({
                    price: product.price,
                    discount: product.discountedPrice,
                  })
                : product.price;

            return (
              <div
                key={item.id}
                className="group bg-white dark:bg-[#1a251d] border border-[#dce5df] dark:border-[#2a3a30] rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-6 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300"
              >
                {/* Image */}
                <Link
                  href={`/product/${product.id}`}
                  className="size-32 rounded-2xl overflow-hidden flex-shrink-0 bg-[#f1f4f2] dark:bg-[#2a3a2f] relative"
                >
                  <Image
                    src={product.images[0] || "/images/placeholder-product.jpg"}
                    alt={product.title}
                    fill
                    className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                  />
                  {!!product.discountedPrice && product.discountedPrice > 0 && (
                    <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-xl z-10">
                      {product.discountedPrice}% OFF
                    </div>
                  )}
                </Link>

                {/* Info + actions */}
                <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
                  <div className="flex flex-col gap-2 max-w-xl">
                    <Link
                      href={`/product/${product.id}`}
                      className="text-lg md:text-xl font-black text-[#121714] dark:text-white hover:text-primary transition-colors leading-tight line-clamp-2"
                    >
                      {product.title}
                    </Link>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                          inStock
                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                        }`}
                      >
                        {inStock ? "In Stock" : "Out of Stock"}
                      </span>
                      {product.category && (
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-full">
                          {product.category.title}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row items-center justify-between md:justify-end gap-4 md:gap-10 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-0 border-gray-100 dark:border-white/5">
                    {/* Price */}
                    <div className="flex flex-col items-start md:items-end">
                      <div className="flex flex-col">
                        <p className="text-xl font-black text-primary">
                          Rs. {Number(finalPrice).toLocaleString()}
                        </p>
                      </div>
                      {!!product.discountedPrice &&
                        product.discountedPrice > 0 && (
                          <p className="text-sm text-gray-400 line-through font-medium">
                            Rs. {Number(product.price).toLocaleString()}
                          </p>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-3">
                      <Button
                        variant="primary"
                        disabled={!inStock}
                        icon="shopping_basket"
                        className="!px-6 !py-3.5 font-bold whitespace-nowrap shadow-lg shadow-primary/20 transition-transform active:scale-95"
                        onClick={() => handleAddToCart(item)}
                      >
                        Add to Cart
                      </Button>
                      <button
                        disabled={removingId === product.id}
                        onClick={() => handleRemove(product.id)}
                        className="size-12 bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-90 disabled:opacity-50 border border-red-100 dark:border-red-500/20"
                        title="Remove from Wishlist"
                      >
                        <span className="material-symbols-outlined text-2xl">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default WishlistPage;
