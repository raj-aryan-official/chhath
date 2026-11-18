import { useSelector } from 'react-redux';
import { selectLanguage } from '../store/slices/languageSlice.js';

export function localizeValue(entity, field, lang) {
  if (!entity) return '';
  if (lang === 'hi') return entity[`${field}Hi`] || entity[field] || '';
  return entity[field] || entity[`${field}Hi`] || '';
}

export function useLocalized() {
  const lang = useSelector(selectLanguage);
  const pick = (entity, field) => localizeValue(entity, field, lang);
  return { lang, pick };
}
