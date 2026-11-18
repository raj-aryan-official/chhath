import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectLanguage } from '../store/slices/languageSlice.js';
import hi from './locales/hi/index.js';
import en from './locales/en/index.js';

export const dictionaries = { hi, en };

const lookup = (dictionary, key) =>
  key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), dictionary);

export function useT() {
  const lang = useSelector(selectLanguage);

  const t = useCallback(
    (key, vars) => {
      let value = lookup(dictionaries[lang], key);
      if (typeof value !== 'string') value = lookup(dictionaries.en, key);
      if (typeof value !== 'string') return key;
      if (!vars) return value;
      return value.replace(/\{\{(\w+)\}\}/g, (_, name) =>
        vars[name] == null ? '' : String(vars[name])
      );
    },
    [lang]
  );

  const tList = useCallback(
    (key) => {
      const list = lookup(dictionaries[lang], key);
      if (Array.isArray(list)) return list;
      const fallback = lookup(dictionaries.en, key);
      return Array.isArray(fallback) ? fallback : [];
    },
    [lang]
  );

  return { t, tList, lang };
}
