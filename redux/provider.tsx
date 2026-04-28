"use client";

import { store } from "./store";
import { Provider, useDispatch } from "react-redux";
import React, { useEffect } from "react";
import { setWishlistItems, setWishlistIds } from "./features/wishlist-slice";
import { setCartItems } from "./features/cart-slice";
import { getWishlistProductIds } from "@/lib/action/wishlist.action";
import { AppDispatch } from "./store";

// Hydrates Redux state from localStorage and keeps it in sync
function StorePersistence() {
  const dispatch = useDispatch<AppDispatch>();

  // Load on mount
  useEffect(() => {
    try {
      const wishlist = localStorage.getItem("v2_wishlist");
      if (wishlist) dispatch(setWishlistItems(JSON.parse(wishlist)));
    } catch {}
    try {
      const cart = localStorage.getItem("v2_cart");
      if (cart) dispatch(setCartItems(JSON.parse(cart)));
    } catch {}
    // Fetch live wishlist IDs from DB
    getWishlistProductIds().then((ids) => {
      dispatch(setWishlistIds(ids));
    }).catch(() => {});
  }, [dispatch]);

  // Save on every store change
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const state = store.getState();
      try {
        localStorage.setItem("v2_wishlist", JSON.stringify(state.wishlistReducer.items));
        localStorage.setItem("v2_cart", JSON.stringify(state.cartReducer.items));
      } catch {}
    });
    return unsubscribe;
  }, []);

  return null;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <StorePersistence />
      {children}
    </Provider>
  );
}