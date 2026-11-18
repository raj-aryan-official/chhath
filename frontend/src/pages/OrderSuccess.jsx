import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock, Package } from 'lucide-react';
import Seo from '../components/seo/Seo.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import LazyImage from '../components/ui/LazyImage.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { KharnaMark } from '../components/brand/KharnaLogo.jsx';
import { fetchOrder } from '../services/order.service.js';
import { useT } from '../i18n/useT.js';
import { useLocalized } from '../i18n/useLocalized.js';
import { useCatalogText } from '../i18n/useCatalogText.js';
import { formatDate, formatINR, cx } from '../utils/format.js';

export default function OrderSuccess() {
  const { id } = useParams();
  const { t } = useT();
  const { pick } = useLocalized();
  const { status: statusText } = useCatalogText();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetchOrder(id)
      .then((result) => {
        if (!cancelled) setOrder(result);
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message || 'fallback');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container-page max-w-2xl py-16">
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container-page py-16">
        <Seo title={t('orders.success.seoTitle')} noIndex path={`/order-success/${id}`} />
        <EmptyState
          icon={Package}
          title={t('orders.success.notFound')}
          description={error === 'fallback' ? t('orders.success.errorLoad') : error || t('orders.success.notFoundDesc')}
          action={<Button to="/account/orders">{t('orders.success.myOrders')}</Button>}
        />
      </div>
    );
  }

  const statusMeta = statusText(order.status);
  const paymentPending = order.paymentStatus !== 'paid' && order.paymentMethod === 'razorpay';

  return (
    <>
      <Seo title={t('orders.success.seoTitle')} noIndex path={`/order-success/${order._id}`} />

      <div className="container-page max-w-3xl py-12">
        <div className="relative overflow-hidden rounded-[2rem] border border-sun-200 bg-white/85 p-6 text-center shadow-warm sm:p-10">
          <div className="sun-rays pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
          <div className="relative">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sun-100">
              <KharnaMark className="h-11 w-11" />
            </span>
            <p className="mt-5 eyebrow justify-center">{t('orders.success.eyebrow')}</p>
            <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
              {paymentPending ? t('orders.success.savedTitle') : t('orders.success.placedTitle')}
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-bamboo-700">
              {paymentPending ? t('orders.success.savedCopy') : t('orders.success.placedCopy')}
            </p>

            <div className="mx-auto mt-5 inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-full border border-sun-200 bg-cream/80 px-5 py-2.5 text-xs text-bamboo-700">
              <span className="font-medium text-ink">{order.orderNumber}</span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-flame-600" aria-hidden="true" />
                {formatDate(order.createdAt, {
                  day: 'numeric',
                  month: 'long',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
              <span
                className={cx(
                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium',
                  statusMeta.chip
                )}
              >
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                {statusMeta.label}
              </span>
            </div>

            <div className="mx-auto mt-8 max-w-lg space-y-2.5 rounded-2xl border border-sun-200 bg-cream/80 p-5 text-left">
              {order.items.map((item, index) => (
                <div key={`${item.slug}-${index}`} className="flex gap-3">
                  <div className="w-12 shrink-0 overflow-hidden rounded-lg border border-sun-200">
                    <LazyImage src={item.image} alt={pick(item, 'name')} aspect="3 / 4" width={96} height={128} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link to={`/product/${item.slug}`} className="block truncate text-xs font-medium text-ink hover:text-sindoor-700">
                      {pick(item, 'name')}
                    </Link>
                    <p className="text-[11px] text-bamboo-600">
                      {item.size} · {t('orders.detail.qty', { qty: item.qty })}
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-ink">{formatINR(item.price * item.qty)}</p>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-sun-200 pt-2.5 text-sm">
                <span className="text-bamboo-700">{t('orders.success.total')}</span>
                <span className="font-semibold text-ink">{formatINR(order.total)}</span>
              </div>
              <p className="text-[11px] text-bamboo-600">
                {order.paymentMethod === 'cod' ? t('orders.success.cod') : t('orders.success.paidOnline')} ·{' '}
                {order.shippingAddress?.city}, {order.shippingAddress?.pincode}
              </p>
            </div>

            <div className="mt-7 flex flex-col items-center justify-center gap-2 sm:flex-row">
              <Button to={`/account/orders/${order._id}`} size="lg" className="w-full sm:w-auto">
                {t('orders.success.track')}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button to="/shop" variant="secondary" size="lg" className="w-full sm:w-auto">
                {t('orders.success.continueShopping')}
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-bamboo-600">
          {t('orders.success.note')}
        </p>
      </div>
    </>
  );
}
