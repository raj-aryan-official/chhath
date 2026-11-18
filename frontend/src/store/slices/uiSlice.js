import { createSlice, nanoid } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: { cartOpen: false, toasts: [] },
  reducers: {
    openCart: (state) => {
      state.cartOpen = true;
    },
    closeCart: (state) => {
      state.cartOpen = false;
    },
    pushToast: (state, action) => {
      state.toasts.push({
        id: nanoid(),
        type: action.payload.type || 'info',
        message: action.payload.message,
      });
      if (state.toasts.length > 4) state.toasts.shift();
    },
    dismissToast: (state, action) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
  },
});

export const { openCart, closeCart, pushToast, dismissToast } = uiSlice.actions;

export default uiSlice.reducer;
