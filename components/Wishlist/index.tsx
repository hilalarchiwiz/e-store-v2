"use client";
import React, { useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { AppDispatch, useAppSelector } from "@/redux/store";
import SingleItem from "./SingleItem";
import { useDispatch } from "react-redux";
import {
  getProductToWishlists,
  removeAllProductFromWishlist,
} from "@/lib/action/home.action";
import {
  removeAllItemsFromWishlist,
  setWishlistItems,
} from "@/redux/features/wishlist-slice";
import toast from "react-hot-toast";
import WishlistSkeleton from "./WishlistSkeleton";

export const Wishlist = () => {
  const dispatch = useDispatch<AppDispatch>();
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const [loading, setLoading] = React.useState(false);
  // Get user from your auth slice if applicable
  const user = useAppSelector((state) => state.userReducer.info);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const result = await getProductToWishlists(user?.id);
      if (result.success) {
        dispatch(setWishlistItems(result?.data || []));
      } else {
        toast.error(result?.message || "Failed to fetch");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false); // Ensures loading stops even if the code fails
    }
  };

  const emptyWishlist = async () => {
    try {
      setLoading(true);
      const result = await removeAllProductFromWishlist();
      console.log(result);
      if (result.success) {
        dispatch(removeAllItemsFromWishlist());
        toast.success(result.message);
      } else {
        toast.error(result?.message || "Failed to fetch");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false); // Ensures loading stops even if the code fails
    }
  };

  useEffect(() => {
    fetchItems();
  }, [user?.id, dispatch]);

  return (
    <>
      <Breadcrumb title={"Wishlist"} pages={["Wishlist"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className=" max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
            <h2 className="font-medium text-dark text-2xl">Your Wishlist</h2>
            {/* {wishlistItems.length > 0 ? (
              <button
                onClick={emptyWishlist}
                className="text-blue cursor-pointer hover:underline"
              >
                Clear Wishlist
              </button>
            ) : null}          */}
          </div>

          {loading ? (
            <WishlistSkeleton />
          ) : wishlistItems.length === 0 ? (
            <div className="flex items-center justify-center">
              <p className="text-dark">Your Wishlist is Empty</p>
            </div>
          ) : (
            <div className="bg-white rounded-[10px] shadow-1">
              <div className="w-full overflow-x-auto">
                <div className="min-w-[1170px]">
                  {/* <!-- table header --> */}
                  <div className="flex items-center py-5.5 px-10">
                    <div className="min-w-[83px]"></div>
                    <div className="min-w-[387px]">
                      <p className="text-dark">Product</p>
                    </div>

                    <div className="min-w-[205px]">
                      <p className="text-dark">Unit Price</p>
                    </div>

                    <div className="min-w-[265px]">
                      <p className="text-dark">Stock Status</p>
                    </div>

                    <div className="min-w-[150px]">
                      <p className="text-dark text-right">Action</p>
                    </div>
                  </div>

                  {/* <!-- wish item --> */}
                  {wishlistItems.map((item, key) => (
                    <SingleItem item={item} key={key} user={user} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};
