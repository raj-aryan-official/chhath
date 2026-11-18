export const currentLocale = () =>
  typeof document !== 'undefined' && document.documentElement.lang === 'en' ? 'en-IN' : 'hi-IN';

export const formatINR = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export const formatDate = (value, options = { day: 'numeric', month: 'short', year: 'numeric' }) => {
  if (!value) return '';
  return new Intl.DateTimeFormat(currentLocale(), options).format(new Date(value));
};

export const formatDateTime = (value) =>
  formatDate(value, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

export const cx = (...classes) => classes.filter(Boolean).join(' ');

export const titleCase = (value) =>
  String(value || '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const pluralize = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;
