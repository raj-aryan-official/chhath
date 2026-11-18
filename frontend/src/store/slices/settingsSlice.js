import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchSettings } from '../../services/catalog.service.js';

export const loadSettings = createAsyncThunk('settings/load', () => fetchSettings(), {
  condition: (_, { getState }) => getState().settings.status === 'idle',
});

const settingsSlice = createSlice({
  name: 'settings',
  initialState: { settings: null, payments: null, status: 'idle' },
  reducers: {
    setSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSettings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadSettings.fulfilled, (state, action) => {
        state.settings = action.payload.settings;
        state.payments = action.payload.payments;
        state.status = 'ready';
      })
      .addCase(loadSettings.rejected, (state) => {
        state.status = 'error';
      });
  },
});

export const { setSettings } = settingsSlice.actions;
export const selectSettings = (state) => state.settings.settings;

export default settingsSlice.reducer;
