import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import LazyImage from '../ui/LazyImage.jsx';
import QuantityStepper from '../ui/QuantityStepper.jsx';
import { removeItem, updateQuantity } from '../../store/slices/cartSlice.js';
import { formatINR } from '../../utils/format.js';
import { useT } from '../../i18n/useT.js';
import { useLocalized } from '../../i18n/useLocalized.js';

export default function CartLine({ item, compact = false, onNavigate }) {
  const dispatch = useDispatch();
  const { t } = useT();
  const { pick } = useLocalized();
  const name = pick(item, 'name');

  return (
    <div className="flex gap-3.5">
      <Link
        to={`/product/${item.slug}`}
        onClick={onNavigate}
        className="w-16 shrink-0 overflow-hidden rounded-xl border border-sun-200 sm:w-20"
        aria-label={t('cart.viewAria', { name })}
      >
        <LazyImage src={item.image} alt={name} aspect="3 / 4" width={160} height={213} />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              to={`/product/${item.slug}`}
              onClick={onNavigate}
              className="block truncate font-display text-[15px] leading-snug text-ink hover:text-sindoor-700"
            >
              {name}
            </Link>
            <p className="mt-0.5 text-xs text-bamboo-600">
              {item.size}
              {item.color ? ` · ${item.color}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => dispatch(removeItem(item))}
            className="rounded-full p-1.5 text-bamboo-600 transition hover:bg-flame-50 hover:text-sindoor-700"
            aria-label={t('cart.removeAria', { name })}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-2">
          <QuantityStepper
            value={item.qty}
            max={Math.min(10, item.stock || 10)}
            size={compact ? 'sm' : 'md'}
            onChange={(qty) => dispatch(updateQuantity({ item, qty }))}
            label={t('cart.qtyLabel', { name })}
          />
          <div className="text-right">
            <p className="text-sm font-semibold text-ink">{formatINR(item.unitPrice * item.qty)}</p>
            {item.qty > 1 && (
              <p className="text-[11px] text-bamboo-600">{t('cart.each', { amount: formatINR(item.unitPrice) })}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
