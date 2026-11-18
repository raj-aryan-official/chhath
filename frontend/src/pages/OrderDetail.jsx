import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  Wallet,
} from 'lucide-react';
import Seo from '../components/seo/Seo.jsx';
import OrderStatusTimeline from '../components/order/OrderStatusTimeline.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import LazyImage from '../components/ui/LazyImage.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import {
  cancelOrder,
  createPaymentOrder,
  fetchOrder,
  verifyPayment,
} from '../services/order.service.js';
import { loadRazorpayScript } from '../utils/razorpay.js';
import { toast } from '../store/index.js';
import { formatDate, formatINR, cx } from '../utils/format.js';
import { useT } from '../i18n/useT.js';
import { useLocalized } from '../i18n/useLocalized.js';
import { useCatalogText } from '../i18n/useCatalogText.js';

const PAYMENT_CHIPS = {
  pending: 'bg-sun-100 text-bamboo-800 border-sun-300',
  paid: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  failed: 'bg-red-50 text-red-800 border-red-200',
  refunded: 'bg-stone-100 text-stone-700 border-stone-300',
};

export default function OrderDetail() {
  const { id } = useParams();
  const { t } = useT();
  const { pick } = useLocalized();
  const { status: statusText } = useCatalogText();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
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

  const doCancel = async () => {
    setCancelling(true);
    try {
      const updated = await cancelOrder(order._id);
      setOrder(updated);
      setConfirmOpen(false);
      toast.success(t('orders.detail.toasts.cancelled'));
    } catch (requestError) {
      toast.error(requestError.message || t('orders.detail.toasts.cancelError'));
    } finally {
      setCancelling(false);
    }
  };

  const payNow = async () => {
    setPaying(true);
    try {
      const Razorpay = await loadRazorpayScript();
      const payment = await createPaymentOrder(order._id);
      const checkout = new Razorpay({
        key: payment.keyId,
        amount: payment.amount,
        currency: payment.currency,
        name: 'KHARNA',
        description: t('checkout.razorpayDesc', { number: payment.orderNumber }),
        order_id: payment.razorpayOrderId,
        prefill: payment.prefill,
        theme: { color: '#EA580C' },
        handler: async (response) => {
          try {
            await verifyPayment({
              orderId: order._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setOrder(await fetchOrder(order._id));
            toast.success(t('orders.detail.toasts.payConfirmed'));
          } catch (verifyError) {
            toast.error(verifyError.message || t('orders.detail.toasts.payVerifyError'));
          } finally {
            setPaying(false);
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      });
      checkout.open();
    } catch (requestError) {
      toast.error(requestError.message || t('orders.detail.toasts.payStartError'));
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="container-page max-w-4xl space-y-4 py-10">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container-page py-16">
        <Seo title={t('orders.list.seoTitle')} noIndex path={`/account/orders/${id}`} />
        <EmptyState
          icon={Package}
          title={t('orders.detail.notFound')}
          description={error === 'fallback' ? t('orders.detail.notFoundError') : error || t('orders.detail.notFoundDesc')}
          action={<Button to="/account/orders">{t('orders.detail.backToOrders')}</Button>}
        />
      </div>
    );
  }

  const statusMeta = statusText(order.status);
  const paymentStatus = order.paymentStatus || 'pending';
  const paymentMeta = {
    label: t(`orders.detail.statuses.${paymentStatus}`),
    chip: PAYMENT_CHIPS[paymentStatus] || PAYMENT_CHIPS.pending,
  };
  const paymentLabel = order.paymentMethod === 'cod' ? t('orders.detail.cod') : t('orders.detail.razorpay');
  const canCancel = ['placed', 'confirmed'].includes(order.status) && order.paymentStatus !== 'paid';
  const canPay =
    order.paymentMethod === 'razorpay' &&
    order.paymentStatus !== 'paid' &&
    order.status !== 'cancelled';
  const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <>
      <Seo title={t('orders.detail.seoTitle', { number: order.orderNumber })} noIndex path={`/account/orders/${order._id}`} />

      <div className="container-page py-10">
        <Link
          to="/account/orders"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-bamboo-700 hover:text-sindoor-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          {t('orders.detail.allOrders')}
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">{t('orders.detail.eyebrow', { number: order.orderNumber })}</p>
            <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
              {statusMeta.label}
            </h1>
            <p className="mt-1 text-sm text-bamboo-700">
              {t('orders.detail.placedOn', {
                date: formatDate(order.createdAt),
                items: t('common.cart.itemCount', { count: itemCount }),
                total: formatINR(order.total),
              })}
            </p>
          </div>
          <span
            className={cx(
              'inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium',
              statusMeta.chip
            )}
          >
            {statusMeta.label}
          </span>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
          <div className="space-y-6">
            <section className="rounded-2xl border border-sun-200 bg-white/85 p-5">
              <h2 className="font-display text-xl text-ink">{t('orders.detail.journey')}</h2>
              <div className="mt-4">
                <OrderStatusTimeline order={order} />
              </div>
            </section>

            <section className="rounded-2xl border border-sun-200 bg-white/85 p-5">
              <h2 className="font-display text-xl text-ink">{t('orders.detail.yourSarees')}</h2>
              <div className="mt-4 divide-y divide-sun-200/70">
                {order.items.map((item, index) => (
                  <div key={`${item.slug}-${index}`} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                    <Link
                      to={`/product/${item.slug}`}
                      className="w-16 shrink-0 overflow-hidden rounded-xl border border-sun-200"
                    >
                      <LazyImage src={item.image} alt={pick(item, 'name')} aspect="3 / 4" width={120} height={160} />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/product/${item.slug}`}
                        className="font-display text-[15px] text-ink hover:text-sindoor-700"
                      >
                        {pick(item, 'name')}
                      </Link>
                      <p className="mt-0.5 text-[11px] text-bamboo-600">
                        {item.size}
                        {item.color ? ` · ${item.color}` : ''} · {t('orders.detail.qty', { qty: item.qty })}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-ink">
                        {formatINR(item.price * item.qty)}
                      </p>
                      {order.status === 'delivered' && (
                        <Link
                          to={`/product/${item.slug}#reviews`}
                          className="mt-1 inline-block text-[11px] font-medium text-sindoor-700 hover:underline"
                        >
                          {t('orders.detail.writeReview')}
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-sun-200 bg-white/85 p-5">
              <h2 className="flex items-center gap-2 font-display text-xl text-ink">
                <MapPin className="h-5 w-5 text-flame-600" aria-hidden="true" />
                {t('orders.detail.addressTitle')}
              </h2>
              <div className="mt-3 text-sm leading-relaxed text-bamboo-800">
                <p className="font-medium text-ink">{order.shippingAddress?.fullName}</p>
                <p>
                  {[order.shippingAddress?.line1, order.shippingAddress?.line2]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} —{' '}
                  {order.shippingAddress?.pincode}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-bamboo-600">
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                  {order.shippingAddress?.phone}
                </p>
              </div>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <section className="rounded-2xl border border-sun-200 bg-white/90 p-5 shadow-warm">
              <h2 className="font-display text-xl text-ink">{t('orders.detail.paymentTitle')}</h2>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-bamboo-700">
                  {order.paymentMethod === 'cod' ? (
                    <Wallet className="h-4 w-4 text-flame-600" aria-hidden="true" />
                  ) : (
                    <CreditCard className="h-4 w-4 text-flame-600" aria-hidden="true" />
                  )}
                  {paymentLabel}
                </span>
                <span
                  className={cx(
                    'rounded-full border px-2.5 py-0.5 text-[10px] font-medium',
                    paymentMeta.chip
                  )}
                >
                  {paymentMeta.label}
                </span>
              </div>

              <dl className="mt-4 space-y-2 border-t border-sun-200 pt-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-bamboo-700">{t('orders.detail.items')}</dt>
                  <dd className="text-ink">{formatINR(order.itemsTotal)}</dd>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-800">
                    <dt>{t('orders.detail.coupon', { code: order.couponCode })}</dt>
                    <dd>−{formatINR(order.discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-bamboo-700">{t('orders.detail.delivery')}</dt>
                  <dd className="text-ink">
                    {order.shippingFee === 0 ? t('orders.detail.free') : formatINR(order.shippingFee)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-sun-200 pt-2.5">
                  <dt className="font-display text-lg text-ink">{t('orders.detail.total')}</dt>
                  <dd className="font-display text-lg text-ink">{formatINR(order.total)}</dd>
                </div>
              </dl>

              {order.deliveryEstimate && (
                <p className="mt-4 rounded-xl bg-sun-50 px-3 py-2 text-[11px] leading-relaxed text-bamboo-700">
                  {t('orders.detail.estimated', { date: formatDate(order.deliveryEstimate) })}
                </p>
              )}

              {canPay && (
                <Button className="mt-4 w-full" onClick={payNow} loading={paying}>
                  {t('orders.detail.completePayment')}
                </Button>
              )}
              {canCancel && (
                <Button
                  variant="outline"
                  className="mt-2 w-full"
                  onClick={() => setConfirmOpen(true)}
                >
                  {t('orders.detail.cancelOrder')}
                </Button>
              )}
            </section>

            <section className="rounded-2xl border border-sun-200 bg-sun-50/70 p-5 text-xs leading-relaxed text-bamboo-700">
              <p className="flex items-center gap-1.5 font-medium text-ink">
                <ShoppingBag className="h-4 w-4 text-flame-600" aria-hidden="true" />
                {t('orders.detail.needHelp')}
              </p>
              <p className="mt-1">
                {t('orders.detail.helpBefore')}{' '}
                <Link to="/contact" className="font-medium text-sindoor-700 hover:underline">
                  {t('orders.detail.helpLink')}
                </Link>{' '}
                {t('orders.detail.helpAfter')}
              </p>
            </section>
          </aside>
        </div>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t('orders.detail.cancelTitle')}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              {t('orders.detail.keepIt')}
            </Button>
            <Button variant="danger" onClick={doCancel} loading={cancelling}>
              {t('orders.detail.yesCancel')}
            </Button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-bamboo-700">{t('orders.detail.cancelCopy')}</p>
      </Modal>
    </>
  );
}
