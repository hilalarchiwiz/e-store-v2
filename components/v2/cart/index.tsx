"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import {
  setCartItems,
  removeItemFromCart,
  updateCartItemQuantity,
} from "@/redux/features/cart-slice";
import {
  getCart,
  updateCartQuantity,
  removeFromCart,
} from "@/lib/action/cart.action";
import Breadcrumbs from "@/components/v2/Breadcrumbs";
import Button from "@/components/v2/Button";
import { toast } from "react-hot-toast";

type CartItemType = Awaited<ReturnType<typeof getCart>>[number];

export default function Cart() {
  const dispatch = useDispatch<AppDispatch>();
  const [items, setItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    getCart().then((data) => {
      setItems(data);
      setLoading(false);
      dispatch(
        setCartItems(
          data.map((item) => ({
            id: item.product.id,
            title: item.product.title,
            price: item.product.price,
            discountedPrice: item.product.discountedPrice ?? item.product.price,
            quantity: item.quantity,
            images: item.product.images,
          }))
        )
      );
    });
  }, [dispatch]);

  const updateQuantity = useCallback(
    async (item: CartItemType, delta: number) => {
      const newQty = item.quantity + delta;
      if (newQty < 1) return;
      setUpdatingId(item.id);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, quantity: newQty } : i))
      );
      dispatch(updateCartItemQuantity({ id: item.product.id, quantity: newQty }));
      const result = await updateCartQuantity(item.id, newQty);
      if (!result.success) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, quantity: item.quantity } : i))
        );
        dispatch(updateCartItemQuantity({ id: item.product.id, quantity: item.quantity }));
        toast.error(result.error ?? "Failed to update quantity");
      }
      setUpdatingId(null);
    },
    [dispatch]
  );

  const removeItem = useCallback(
    async (item: CartItemType) => {
      setUpdatingId(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      dispatch(removeItemFromCart(item.product.id));
      const result = await removeFromCart(item.id);
      if (!result.success) {
        setItems((prev) => [...prev, item]);
        toast.error("Failed to remove item");
      } else {
        toast.success("Removed from cart");
      }
      setUpdatingId(null);
    },
    [dispatch]
  );

  const subtotal = items.reduce((sum, item) => {
    const price = item.product.discountedPrice && item.product.discountedPrice > 0
      ? item.product.price - (item.product.price * item.product.discountedPrice) / 100
      : item.product.price;
    return sum + price * item.quantity;
  }, 0);
  const shipping = subtotal > 5000 ? 0 : 250; // Free shipping over PKR 5,000
  const tax = subtotal * 0.02;
  const total = subtotal + shipping + tax;

  return (
    <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 py-10 md:py-16 flex flex-col gap-10">
      <Breadcrumbs
        items={[{ label: "Home", href: "/v2" }, { label: "Shopping Cart" }]}
      />

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#dce5df] dark:border-[#2a3a30]">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-3xl">shopping_cart</span>
          </div>
          <div>
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-0.5">
              Your Basket
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-[#121714] dark:text-white leading-tight">
              Shopping Cart
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
              className="bg-white dark:bg-[#1a251d] border border-[#dce5df] dark:border-[#2a3a30] rounded-2xl p-6 h-32 animate-pulse"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-24 flex flex-col items-center text-center bg-white dark:bg-[#1a251d] rounded-3xl border border-primary/5 shadow-xl">
          <div className="size-32 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-8">
            <span className="material-symbols-outlined text-6xl">shopping_basket</span>
          </div>
          <h2 className="text-2xl font-bold text-[#121714] dark:text-white mb-2">
            Your basket is empty
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-10 leading-relaxed px-6">
            Looks like you haven't added anything yet. Explore our sustainable
            collection and find something you love.
          </p>
          <Button variant="primary" icon="shopping_bag">
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Cart Items */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-white dark:bg-[#1a251d] rounded-3xl border border-primary/5 shadow-xl overflow-hidden">
              {/* Table header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-4 bg-[#f1f4f2] dark:bg-white/5 border-b border-gray-100 dark:border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-white/5">
                {items.map((item) => {
                  const price = item.product.discountedPrice && item.product.discountedPrice > 0
                    ? item.product.price - (item.product.price * item.product.discountedPrice) / 100
                    : item.product.price;
                  const isUpdating = updatingId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`grid grid-cols-1 md:grid-cols-12 gap-6 p-6 md:p-8 items-center group transition-opacity ${isUpdating ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      {/* Product Info */}
                      <div className="md:col-span-6 flex items-center gap-5">
                        <div className="size-24 rounded-2xl overflow-hidden bg-[#f1f4f2] dark:bg-[#2a3a2f] shrink-0 relative">
                          <Image
                            src={item.product.images[0] || "/images/placeholder-product.jpg"}
                            alt={item.product.title}
                            fill
                            className="object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                          />
                          <button
                            onClick={() => removeItem(item)}
                            className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                        <div>
                          <Link
                            href={`/product/${item.product.id}`}
                            className="text-base font-black text-[#121714] dark:text-white hover:text-primary transition-colors leading-snug line-clamp-2"
                          >
                            {item.product.title}
                          </Link>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="size-2 rounded-full bg-green-500" />
                            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">
                              In Stock
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Unit Price */}
                      <div className="md:col-span-2 text-center">
                        <span className="md:hidden text-xs font-bold text-gray-400 block mb-1">Price</span>
                        <p className="font-extrabold text-[#121714] dark:text-white">
                          PKR {Number(price).toLocaleString()}
                        </p>
                        {item.product.discountedPrice && item.product.discountedPrice < item.product.price && (
                          <p className="text-xs text-gray-400 line-through">
                            PKR {Number(item.product.price).toLocaleString()}
                          </p>
                        )}
                      </div>

                      {/* Quantity */}
                      <div className="md:col-span-2 flex justify-center">
                        <div className="flex flex-col items-center">
                          <span className="md:hidden text-xs font-bold text-gray-400 mb-2">Qty</span>
                          <div className="flex items-center bg-[#f1f4f2] dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 px-2 py-1">
                            <button
                              onClick={() => updateQuantity(item, -1)}
                              disabled={item.quantity <= 1}
                              className="size-8 flex items-center justify-center text-[#648770] hover:text-primary hover:bg-primary/10 rounded-lg transition-all disabled:opacity-30"
                            >
                              <span className="material-symbols-outlined text-base">remove</span>
                            </button>
                            <span className="w-10 text-center font-black text-[#121714] dark:text-white text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item, 1)}
                              disabled={item.quantity >= item.product.quantity}
                              title={item.quantity >= item.product.quantity ? `Max stock: ${item.product.quantity}` : undefined}
                              className="size-8 flex items-center justify-center text-[#648770] hover:text-primary hover:bg-primary/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <span className="material-symbols-outlined text-base">add</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Line Total */}
                      <div className="md:col-span-2 text-right">
                        <span className="md:hidden text-xs font-bold text-gray-400 block mb-1">Total</span>
                        <p className="text-xl font-black text-primary">
                          PKR {(price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between items-center px-4">
              <Link
                href="/shop"
                className="group flex items-center gap-2 text-sm font-bold text-[#648770] hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-base group-hover:-translate-x-1 transition-transform">
                  arrow_back
                </span>
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-[#1a251d] rounded-3xl border border-primary/5 shadow-xl p-8">
              <h2 className="text-2xl font-black text-[#121714] dark:text-white mb-8">
                Order Summary
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-[#121714] dark:text-white">PKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-gray-500">Eco-Friendly Shipping</span>
                  <span className={shipping === 0 ? "text-green-500" : "text-[#121714] dark:text-white"}>
                    {shipping === 0 ? "FREE" : `PKR ${shipping.toLocaleString()}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-[10px] text-gray-400">Free shipping on orders over PKR 5,000</p>
                )}
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-gray-500">Eco-Tax (2%)</span>
                  <span className="text-[#121714] dark:text-white">PKR {tax.toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-white/5 pt-6 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-[#121714] dark:text-white">Total Amount</span>
                  <span className="text-3xl font-black text-primary">PKR {total.toLocaleString()}</span>
                </div>
              </div>

              <Link href="/checkout" className="block w-full">
                <Button fullWidth icon="payments" className="py-5 shadow-2xl">
                  Proceed to Checkout
                </Button>
              </Link>

              <div className="mt-6 flex items-center gap-3 p-4 bg-green-50 dark:bg-primary/5 rounded-2xl">
                <span className="material-symbols-outlined text-green-600 shrink-0">eco</span>
                <p className="text-[10px] font-bold text-green-700 dark:text-green-500 leading-tight">
                  This order will plant 2 trees through our partnership with One Tree Planted.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
