import {
  CHHATH_DAYS,
  COLORS,
  FABRICS,
  ORDER_STATUS,
  PRICE_BANDS,
  SORT_OPTIONS,
} from '../utils/constants.js';
import { useT } from './useT.js';

export function useCatalogText() {
  const { lang } = useT();
  const suffix = lang === 'hi' ? 'Hi' : '';

  return {
    lang,
    fabricLabel: (name) => {
      const fabric = FABRICS.find((entry) => entry.name === name);
      return fabric?.[`name${suffix}`] || name;
    },
    fabricDetails: (name) => {
      const fabric = FABRICS.find((entry) => entry.name === name);
      return {
        label: fabric?.[`name${suffix}`] || name,
        blurb: fabric?.[`blurb${suffix}`] || fabric?.blurb || '',
        care: fabric?.[`care${suffix}`] || fabric?.care || '',
      };
    },
    dayLabel: (name) => {
      const day = CHHATH_DAYS.find((entry) => entry.name === name);
      return day?.[`name${suffix}`] || name;
    },
    dayDetails: (name) => {
      const day = CHHATH_DAYS.find((entry) => entry.name === name);
      return {
        label: day?.[`name${suffix}`] || name,
        blurb: day?.[`blurb${suffix}`] || day?.blurb || '',
      };
    },
    colorLabel: (name) => {
      const color = COLORS.find((entry) => entry.name === name);
      return color?.[`name${suffix}`] || name;
    },
    status: (key) => {
      const status = ORDER_STATUS[key];
      return {
        label: status?.[`label${suffix}`] || status?.label || key,
        description: status?.[`description${suffix}`] || status?.description || '',
        chip: status?.chip || '',
      };
    },
    sortLabel: (value) => {
      const option = SORT_OPTIONS.find((entry) => entry.value === value);
      return option?.[`label${suffix}`] || option?.label || value;
    },
    priceBandLabel: (band) => band?.[`label${suffix}`] || band?.label || '',
    priceBands: PRICE_BANDS.map((band) => ({
      ...band,
      display: band?.[`label${suffix}`] || band.label,
    })),
  };
}
