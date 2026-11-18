import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'kharna_lang';

export const LANGUAGES = ['hi', 'en'];

const readInitial = () => {
  if (typeof window === 'undefined') return 'hi';
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === 'en' ? 'en' : 'hi';
  } catch {
    return 'hi';
  }
};

const languageSlice = createSlice({
  name: 'language',
  initialState: { lang: readInitial() },
  reducers: {
    setLanguage(state, action) {
      state.lang = action.payload === 'en' ? 'en' : 'hi';
    },
  },
});

export const { setLanguage } = languageSlice.actions;
export const selectLanguage = (state) => state.language.lang;
export const persistLanguage = (lang) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* private mode: the language still works for this session */
  }
};
export default languageSlice.reducer;
