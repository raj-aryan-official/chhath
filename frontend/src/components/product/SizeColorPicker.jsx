import { Check } from 'lucide-react';
import { formatINR, cx } from '../../utils/format.js';
import { useT } from '../../i18n/useT.js';
import { useCatalogText } from '../../i18n/useCatalogText.js';

export default function SizeColorPicker({ product, size, onSizeChange }) {
  const { t } = useT();
  const { colorLabel } = useCatalogText();
  const sizes = product.sizes?.length
    ? product.sizes
    : [{ label: 'Free Size', priceDelta: 0 }];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-bamboo-700">
          {t('product.details.colourHeading')}
        </p>
        <div className="mt-2 flex items-center gap-3">
          <span
            className="relative flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-sindoor-700 ring-offset-2 ring-offset-cream"
            style={{ backgroundColor: product.color?.hex || '#F5C518' }}
            aria-hidden="true"
          >
            <Check className="h-4 w-4 text-white drop-shadow" />
          </span>
          <div>
            <p className="text-sm font-medium text-ink">
              {product.color?.name ? colorLabel(product.color.name) : t('product.details.defaultColour')}
            </p>
            <p className="text-[11px] text-bamboo-600">{t('product.details.oneColourway')}</p>
          </div>
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-bamboo-700">
          {t('product.details.sizeBlouse')}
        </p>
        <div className="mt-2 grid gap-2" role="radiogroup" aria-label={t('product.details.sizeAria')}>
          {sizes.map((option) => {
            const active = option.label === size;
            return (
              <button
                key={option.label}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onSizeChange(option.label)}
                className={cx(
                  'flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition',
                  active
                    ? 'border-flame-600 bg-flame-50 shadow-[0_6px_18px_-12px_rgba(234,88,12,0.6)]'
                    : 'border-sun-300 bg-white hover:border-flame-400'
                )}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={cx(
                      'flex h-4 w-4 items-center justify-center rounded-full border',
                      active ? 'border-flame-600 bg-flame-600 text-white' : 'border-sun-400 bg-white'
                    )}
                    aria-hidden="true"
                  >
                    {active && <Check className="h-2.5 w-2.5" />}
                  </span>
                  <span className="text-sm text-ink">
                    {option.label === 'Free Size' ? t('product.details.freeSize') : option.label}
                  </span>
                </span>
                <span className="text-xs font-medium text-bamboo-700">
                  {option.priceDelta > 0
                    ? `+${formatINR(option.priceDelta)}`
                    : t('product.details.sizeIncluded')}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
