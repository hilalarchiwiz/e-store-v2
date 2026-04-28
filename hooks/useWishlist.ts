"use client";

import { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector, AppDispatch } from "@/redux/store";
import {
  setWishlistIds,
  addWishlistId,
  removeWishlistId,
} from "@/redux/features/wishlist-slice";
import toast from "react-hot-toast";
import {
  getWishlistProductIds,
  addToWishlist,
  removeFromWishlistByProductId,
} from "@/lib/action/wishlist.action";

export function useWishlist() {
  const dispatch = useDispatch<AppDispatch>();
  const wishlistIds = useAppSelector((state) => state.wishlistReducer.ids);

  useEffect(() => {
    getWishlistProductIds().then((ids) => {
      dispatch(setWishlistIds(ids));
    });
  }, [dispatch]);

  const isInWishlist = useCallback(
    (id: number) => wishlistIds.includes(id),
    [wishlistIds]
  );

  const toggleWishlist = useCallback(
    async (productId: number) => {
      if (wishlistIds.includes(productId)) {
        // Optimistic remove
        dispatch(removeWishlistId(productId));
        const result = await removeFromWishlistByProductId(productId);
        if (result.success) {
          toast.error("Removed from wishlist");
        } else {
          // Rollback
          dispatch(addWishlistId(productId));
          toast.error("Failed to update wishlist");
        }
      } else {
        // Optimistic add
        dispatch(addWishlistId(productId));
        const result = await addToWishlist(productId);
        if (result.success) {
          toast.success("Added to wishlist");
        } else {
          // Rollback
          dispatch(removeWishlistId(productId));
          toast.error("Failed to update wishlist");
        }
      }
    },
    [wishlistIds, dispatch]
  );

  return { isInWishlist, toggleWishlist };
}
