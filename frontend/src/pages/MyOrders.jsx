import { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import Seo from '../components/seo/Seo.jsx';
import OrderCard from '../components/order/OrderCard.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Button from '../components/ui/Button.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import { OrdersSkeleton } from '../components/ui/Skeleton.jsx';
import { fetchMyOrders } from '../services/order.service.js';
import { useT } from '../i18n/useT.js';

const LIMIT = 8;

export default function MyOrders() {
  const { t } = useT();
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    fetchMyOrders({ page, limit: LIMIT })
      .then((result) => {
        if (cancelled) return;
        setOrders(result.orders);
        setPages(result.pages);
        setTotal(result.total);
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
  }, [page]);

  return (
    <>
      <Seo title={t('orders.list.seoTitle')} noIndex path="/account/orders" />

      <div className="container-page py-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">{t('orders.list.eyebrow')}</p>
            <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">{t('orders.list.title')}</h1>
            <p className="mt-1 text-sm text-bamboo-700">{t('orders.list.subtitle')}</p>
          </div>
          {!loading && total > 0 && (
            <p className="text-sm text-bamboo-600">
              {t(total === 1 ? 'orders.list.countOne' : 'orders.list.countMany', { count: total })}
            </p>
          )}
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error === 'fallback' ? t('orders.list.errorLoad') : error}
          </div>
        )}

        <div className="mt-8">
          {loading ? (
            <OrdersSkeleton />
          ) : orders.length === 0 ? (
            <EmptyState
              icon={Package}
              title={t('orders.list.emptyTitle')}
              description={t('orders.list.emptyDescription')}
              action={<Button to="/shop">{t('orders.list.emptyAction')}</Button>}
            />
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          )}
        </div>

        <Pagination
          page={page}
          pages={pages}
          onChange={(next) => {
            setPage(next);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="mt-8"
        />
      </div>
    </>
  );
}
