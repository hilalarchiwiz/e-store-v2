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

  const handleRemove = useCallback(async (productId: number) => {
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
  }, [dispatch]);

  const handleAddToCart = useCallback(async (item: WishlistItem) => {
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
        })
      );
      toast.success("Added to cart");
    } else {
      toast.error("Failed to add to cart");
    }
  }, [dispatch]);

  return (
    <main className="max-w-[1200px] mx-auto w-full px-6 py-10 md:py-16 flex flex-col gap-10">
      <Breadcrumbs
        items={[{ label: "Home", href: "/v2" }, { label: "My Wishlist" }]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#dce5df] dark:border-[#2a3a30]">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-3xl fill-1">favorite</span>
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
            <span className="material-symbols-outlined text-base">inventory_2</span>
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
            <span className="material-symbols-outlined !text-6xl">favorite</span>
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
            const displayPrice = product.discountedPrice ?? product.price;

            return (
              <div
                key={item.id}
                className="group bg-white dark:bg-[#1a251d] border border-[#dce5df] dark:border-[#2a3a30] rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-6 shadow-sm hover:shadow-md transition-all"
              >
                {/* Image */}
                <Link
                  href={`/product/${product.id}`}
                  className="size-28 rounded-xl overflow-hidden flex-shrink-0 bg-[#f1f4f2] dark:bg-[#2a3a2f]"
                >
                  <Image
                    src={product.images[0] || "/images/placeholder-product.jpg"}
                    alt={product.title}
                    width={112}
                    height={112}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>

                {/* Info + actions */}
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                  <div className="flex flex-col gap-1.5">
                    <Link
                      href={`/product/${product.id}`}
                      className="text-lg font-black text-[#121714] dark:text-white hover:text-primary transition-colors leading-snug"
                    >
                      {product.title}
                    </Link>
                    <span
                      className={`self-start text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${inStock
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                        }`}
                    >
                      {inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 sm:gap-8">
                    {/* Price */}
                    <div className="text-right">
                      <p className="text-xl font-black text-[#121714] dark:text-white">
                        ${Number(displayPrice).toFixed(2)}
                      </p>
                      {product.discountedPrice && product.discountedPrice < product.price && (
                        <p className="text-xs text-gray-400 line-through">
                          ${Number(product.price).toFixed(2)}
                        </p>
                      )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        disabled={!inStock}
                        icon="add_shopping_cart"
                        className="!p-3 !px-5 text-sm"
                        onClick={() => handleAddToCart(item)}
                      >
                        Add
                      </Button>
                      <button
                        disabled={removingId === product.id}
                        onClick={() => handleRemove(product.id)}
                        className="size-11 border border-red-100 dark:border-red-900/30 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-xl">
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
