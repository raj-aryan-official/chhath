import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as accountService from '../../services/account.service.js';

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetch',
  async (_, { getState }) => {
    if (!getState().auth.user) return [];
    return accountService.fetchWishlist();
  },
  {
    condition: (_, { getState }) => Boolean(getState().auth.user),
  }
);

export const toggleWishlist = createAsyncThunk(
  'wishlist/toggle',
  async (product, { getState, rejectWithValue }) => {
    const { auth, wishlist } = getState();
    if (!auth.user) return rejectWithValue('Sign in to save sarees to your wishlist');

    const exists = wishlist.products.some((entry) => entry._id === product._id);
    if (exists) {
      await accountService.removeFromWishlist(product._id);
      return { added: null, removedId: product._id };
    }
    await accountService.addToWishlist(product._id);
    return { added: product, removedId: null };
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { products: [], status: 'idle' },
  reducers: {
    resetWishlist: (state) => {
      state.products = [];
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.products = action.payload || [];
        state.status = 'ready';
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        if (action.payload.removedId) {
          state.products = state.products.filter((item) => item._id !== action.payload.removedId);
        } else if (action.payload.added) {
          state.products = [action.payload.added, ...state.products];
        }
      });
  },
});

export const { resetWishlist } = wishlistSlice.actions;
export const selectWishlistIds = (state) => state.wishlist.products.map((item) => item._id);

export default wishlistSlice.reducer;
