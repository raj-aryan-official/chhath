import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as accountService from '../../services/account.service.js';
import * as authService from '../../services/auth.service.js';
import { mergeGuestCart, resetCart } from './cartSlice.js';
import { fetchWishlist, resetWishlist } from './wishlistSlice.js';

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.me();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  {
    condition: (force, { getState }) => force === true || getState().auth.status === 'idle',
  }
);

export const login = createAsyncThunk('auth/login', async (payload, { dispatch }) => {
  const user = await authService.login(payload);
  await dispatch(mergeGuestCart());
  dispatch(fetchWishlist());
  return user;
});

export const register = createAsyncThunk('auth/register', async (payload, { dispatch }) => {
  const user = await authService.register(payload);
  await dispatch(mergeGuestCart());
  return user;
});

export const logout = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
  await authService.logout();
  dispatch(resetCart());
  dispatch(resetWishlist());
  return null;
});

export const updateProfile = createAsyncThunk('auth/updateProfile', (payload) =>
  accountService.updateProfile(payload)
);

export const saveAddress = createAsyncThunk('auth/saveAddress', async ({ id, ...payload }) => {
  const addresses = id
    ? await accountService.updateAddress(id, payload)
    : await accountService.addAddress(payload);
  return addresses;
});

export const removeAddress = createAsyncThunk('auth/removeAddress', (id) =>
  accountService.deleteAddress(id)
);

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, status: 'idle', error: null },
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'ready';
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.status = 'ready';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'ready';
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'ready';
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.status = 'ready';
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(saveAddress.fulfilled, (state, action) => {
        if (state.user) state.user.addresses = action.payload;
      })
      .addCase(removeAddress.fulfilled, (state, action) => {
        if (state.user) state.user.addresses = action.payload;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export const selectUser = (state) => state.auth.user;
export const selectIsAdmin = (state) => state.auth.user?.role === 'admin';

export default authSlice.reducer;
