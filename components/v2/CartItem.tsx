"use client";

import React from "react";
import { updateCartQuantity, removeFromCart } from "@/lib/action/cart.action";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface CartItemProps {
  item: any;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const handleQuantityChange = async (delta: number) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;

    const result = await updateCartQuantity(item.id, newQuantity);
    if (!result.success) {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemove = async () => {
    const result = await removeFromCart(item.id);
    if (result.success) {
      toast.success("Removed from cart");
    } else {
      toast.error("Failed to remove item");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-white dark:bg-[#1a251d] rounded-2xl border border-[#e5e9e6] dark:border-[#2a3a30]">
      <div className="size-24 bg-[#f1f4f2] dark:bg-[#2a3a2f] rounded-xl overflow-hidden shrink-0">
        <img
          src={item.product.images[0] || "/images/placeholder-product.jpg"}
          alt={item.product.title}
          className="w-full h-full object-contain p-2"
        />
      </div>

      <div className="flex-1 flex flex-col gap-1 w-full text-center sm:text-left">
        <h3 className="font-bold text-lg text-[#121714] dark:text-white">
          {item.product.title}
        </h3>
        <div className="flex flex-col gap-0.5">
          <p className="font-extrabold text-[#121714] dark:text-white">
            PKR {((item.product.discountedPrice && item.product.discountedPrice > 0) ? (item.product.price - (item.product.price * item.product.discountedPrice) / 100) : item.product.price).toLocaleString()}
          </p>
          {item.product.discountedPrice && item.product.discountedPrice > 0 && (
            <p className="text-xs text-gray-400 line-through">
              PKR {item.product.price.toLocaleString()}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1 bg-white dark:bg-black/20">
          <button
            onClick={() => handleQuantityChange(-1)}
            className="size-8 flex items-center justify-center text-gray-500 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-sm">remove</span>
          </button>
          <span className="w-8 text-center font-bold">{item.quantity}</span>
          <button
            onClick={() => handleQuantityChange(1)}
            className="size-8 flex items-center justify-center text-gray-500 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-sm">add</span>
          </button>
        </div>

        <div className="font-bold text-lg min-w-[80px] text-right">
          PKR {(item.product.price * item.quantity).toLocaleString()}
        </div>

        <button
          onClick={handleRemove}
          className="size-10 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-outlined">delete</span>
        </button>
      </div>
    </div>
  );
};

export default CartItem;
