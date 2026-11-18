import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import * as cartService from '../../services/cart.service.js';

const GUEST_KEY = 'kharna_guest_cart';

const readGuest = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(GUEST_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeGuest = (items) => {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(items));
  } catch {
    /* storage can be unavailable in private mode — the cart still works for this session */
  }
};

const mapServerCart = (cart) =>
  (cart?.items || []).map((item) => ({
    key: `srv-${item.itemId}`,
    itemId: item.itemId,
    productId: item.productId,
    name: item.name,
    nameHi: item.nameHi || '',
    slug: item.slug,
    image: item.image,
    size: item.size,
    qty: item.qty,
    unitPrice: item.unitPrice,
    stock: item.stock,
    fabric: item.fabric,
    color: item.color,
  }));

export const initCart = createAsyncThunk('cart/init', async (_, { getState }) => {
  if (getState().auth.user) {
    return mapServerCart(await cartService.getCart());
  }
  return readGuest();
});

export const addItem = createAsyncThunk('cart/addItem', async ({ product, size, qty }, { getState }) => {
  if (getState().auth.user) {
    return mapServerCart(await cartService.addToCart({ productId: product._id, size, qty }));
  }

  const sizeOption = (product.sizes || []).find((option) => option.label === size);
  const items = readGuest();
  const key = `${product._id}:${size}`;
  const existing = items.find((item) => item.key === key);
  const cap = Math.min(10, product.stock ?? 10);

  if (existing) {
    existing.qty = Math.min(existing.qty + qty, cap);
  } else {
    items.push({
      key,
      productId: product._id,
      name: product.name,
      nameHi: product.nameHi || '',
      slug: product.slug,
      image: product.images?.[0] || '',
      size,
      qty: Math.min(qty, cap),
      unitPrice: product.price + (sizeOption?.priceDelta || 0),
      stock: product.stock ?? 10,
      fabric: product.fabric,
      color: product.color?.name || '',
    });
  }

  writeGuest(items);
  return items;
});

export const updateQuantity = createAsyncThunk('cart/updateQuantity', async ({ item, qty }, { getState }) => {
  if (getState().auth.user) {
    return mapServerCart(await cartService.updateCartItem(item.itemId, qty));
  }
  const items = readGuest().map((entry) =>
    entry.key === item.key
      ? { ...entry, qty: Math.min(Math.max(1, qty), 10, entry.stock) }
      : entry
  );
  writeGuest(items);
  return items;
});

export const removeItem = createAsyncThunk('cart/removeItem', async (item, { getState }) => {
  if (getState().auth.user) {
    return mapServerCart(await cartService.removeCartItem(item.itemId));
  }
  const items = readGuest().filter((entry) => entry.key !== item.key);
  writeGuest(items);
  return items;
});

export const clearAll = createAsyncThunk('cart/clear', async (_, { getState }) => {
  if (getState().auth.user) {
    return mapServerCart(await cartService.clearCart());
  }
  writeGuest([]);
  return [];
});

export const mergeGuestCart = createAsyncThunk('cart/merge', async (_, { getState }) => {
  const guestItems = getState().cart.items.filter((item) => !item.itemId);
  const cart = guestItems.length
    ? await cartService.mergeCart(guestItems)
    : await cartService.getCart();
  writeGuest([]);
  return mapServerCart(cart);
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], status: 'idle', syncing: false, error: null },
  reducers: {
    resetCart: (state) => {
      state.items = [];
      state.status = 'idle';
      state.syncing = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initCart.pending, (state) => {
        if (state.status === 'idle') state.status = 'loading';
      })
      .addCase(initCart.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'ready';
      })
      .addCase(initCart.rejected, (state) => {
        state.items = readGuest();
        state.status = 'ready';
      })
      .addCase(addItem.pending, (state) => {
        state.syncing = true;
      })
      .addCase(addItem.fulfilled, (state, action) => {
        state.items = action.payload;
        state.syncing = false;
      })
      .addCase(addItem.rejected, (state, action) => {
        state.syncing = false;
        state.error = action.error.message;
      })
      .addCase(updateQuantity.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(removeItem.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(clearAll.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(mergeGuestCart.pending, (state) => {
        state.syncing = true;
      })
      .addCase(mergeGuestCart.fulfilled, (state, action) => {
        state.items = action.payload;
        state.syncing = false;
      })
      .addCase(mergeGuestCart.rejected, (state) => {
        state.syncing = false;
      });
  },
});

export const { resetCart } = cartSlice.actions;

export const selectCartCount = createSelector(
  [(state) => state.cart.items],
  (items) => items.reduce((sum, item) => sum + item.qty, 0)
);

export const selectCartTotals = createSelector(
  [(state) => state.cart.items, (state) => state.settings.settings],
  (items, settings) => {
    const itemsTotal = items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
    const freeThreshold = settings?.freeShippingThreshold ?? 1999;
    const fee = settings?.shippingFee ?? 79;
    const shippingFee = items.length === 0 || itemsTotal >= freeThreshold ? 0 : fee;

    return {
      itemsTotal,
      shippingFee,
      total: itemsTotal + shippingFee,
      freeThreshold,
      remainingForFree: Math.max(0, freeThreshold - itemsTotal),
    };
  }
);

export default cartSlice.reducer;
