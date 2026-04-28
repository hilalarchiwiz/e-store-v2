import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type InitialState = {
  items: WishListItem[];
  count: number;
  ids: number[];
};

type WishListItem = {
  id: number;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  status?: string;
  images: string[];
};

const initialState: InitialState = {
  items: [],
  count: 0,
  ids: [],
};

export const wishlist = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addItemToWishlist: (state, action: PayloadAction<WishListItem>) => {
      const { id, title, price, quantity, images, discountedPrice, status } =
        action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          id,
          title,
          price,
          quantity,
          images,
          discountedPrice,
          status,
        });
      }
    },

    removeItemFromWishlist: (state, action: PayloadAction<number>) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);
    },

    removeAllItemsFromWishlist: (state) => {
      state.items = [];
    },

    setWishlistItems: (state, action: PayloadAction<WishListItem[]>) => {
      state.items = action.payload;
    },
    setWishlistCount: (state, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    setWishlistIds: (state, action: PayloadAction<number[]>) => {
      state.ids = action.payload;
      state.count = action.payload.length;
    },
    addWishlistId: (state, action: PayloadAction<number>) => {
      if (!state.ids.includes(action.payload)) {
        state.ids.push(action.payload);
        state.count = state.ids.length;
      }
    },
    removeWishlistId: (state, action: PayloadAction<number>) => {
      state.ids = state.ids.filter((id) => id !== action.payload);
      state.count = state.ids.length;
    },
  },
});

export const {
  addItemToWishlist,
  removeItemFromWishlist,
  removeAllItemsFromWishlist,
  setWishlistItems,
  setWishlistCount,
  setWishlistIds,
  addWishlistId,
  removeWishlistId,
} = wishlist.actions;
export default wishlist.reducer;
