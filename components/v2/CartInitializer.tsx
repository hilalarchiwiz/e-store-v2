"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { setCartItems } from "@/redux/features/cart-slice";
import { getCart } from "@/lib/action/cart.action";

export default function CartInitializer() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const initializeCart = async () => {
      try {
        const data = await getCart();
        if (data && data.length > 0) {
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
        }
      } catch (error) {
        console.error("Failed to initialize cart:", error);
      }
    };

    initializeCart();
  }, [dispatch]);

  return null;
}
