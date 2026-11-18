import { Link } from 'react-router-dom';
import { ArrowRight, Package } from 'lucide-react';
import LazyImage from '../ui/LazyImage.jsx';
import { formatDate, formatINR, cx } from '../../utils/format.js';
import { useT } from '../../i18n/useT.js';
import { useLocalized } from '../../i18n/useLocalized.js';
import { useCatalogText } from '../../i18n/useCatalogText.js';

export default function OrderCard({ order }) {
  const { t } = useT();
  const { pick } = useLocalized();
  const { status } = useCatalogText();
  const meta = status(order.status);
  const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <article className="rounded-2xl border border-sun-200 bg-white/85 p-5 transition hover:border-flame-300 hover:shadow-warm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Package className="h-4 w-4 text-flame-600" aria-hidden="true" />
            {order.orderNumber}
          </p>
          <p className="mt-1 text-[11px] text-bamboo-600">
            {t('orders.card.placedOn', {
              date: formatDate(order.createdAt),
              items: t('common.cart.itemCount', { count: itemCount }),
            })}
          </p>
        </div>
        <span
          className={cx(
            'inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium',
            meta.chip
          )}
        >
          {meta.label}
        </span>
      </div>

      <div className="mt-4 flex gap-2 overflow-hidden">
        {order.items.slice(0, 4).map((item, index) => (
          <Link
            key={`${item.slug}-${index}`}
            to={`/product/${item.slug}`}
            className="w-14 shrink-0 overflow-hidden rounded-lg border border-sun-200"
            aria-label={t('orders.card.viewItem', { name: pick(item, 'name') })}
          >
            <LazyImage src={item.image} alt={pick(item, 'name')} aspect="3 / 4" width={120} height={160} />
          </Link>
        ))}
        {order.items.length > 4 && (
          <span className="flex w-14 items-center justify-center rounded-lg border border-sun-200 bg-sun-50 text-[11px] text-bamboo-700">
            +{order.items.length - 4}
          </span>
        )}
      </div>

      <p className="mt-3 line-clamp-1 text-xs text-bamboo-700">
        {order.items.map((item) => pick(item, 'name')).join(', ')}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-sun-200 pt-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-bamboo-600">{t('orders.card.total')}</p>
          <p className="text-sm font-semibold text-ink">{formatINR(order.total)}</p>
        </div>
        <Link
          to={`/account/orders/${order._id}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-sindoor-700 hover:underline"
        >
          {t('orders.card.viewDetails')}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
