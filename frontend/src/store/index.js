import { configureStore } from '@reduxjs/toolkit';
import auth from './slices/authSlice.js';
import cart from './slices/cartSlice.js';
import language from './slices/languageSlice.js';
import settings from './slices/settingsSlice.js';
import ui from './slices/uiSlice.js';
import wishlist from './slices/wishlistSlice.js';
import { pushToast } from './slices/uiSlice.js';

export const store = configureStore({
  reducer: { auth, cart, wishlist, settings, ui, language },
});

export const toast = {
  success: (message) => store.dispatch(pushToast({ type: 'success', message })),
  error: (message) => store.dispatch(pushToast({ type: 'error', message })),
  info: (message) => store.dispatch(pushToast({ type: 'info', message })),
};
