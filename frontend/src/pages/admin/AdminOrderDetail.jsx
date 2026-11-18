import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, User } from 'lucide-react';
import Seo from '../../components/seo/Seo.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import OrderStatusTimeline from '../../components/order/OrderStatusTimeline.jsx';
import { fetchOrder } from '../../services/order.service.js';
import { updateOrderStatus } from '../../services/admin.service.js';
import { toast } from '../../store/index.js';
import { formatDateTime, formatINR, cx } from '../../utils/format.js';
import { ORDER_STATUS, STATUS_FLOW } from '../../utils/constants.js';

const STATUS_TONE = {
  placed: 'sun',
  confirmed: 'flame',
  packed: 'flame',
  shipped: 'sun',
  delivered: 'success',
  cancelled: 'neutral',
};

const PAYMENT_TONE = {
  paid: 'success',
  pending: 'flame',
  failed: 'neutral',
  refunded: 'neutral',
};

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [nextStatus, setNextStatus] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      setOrder(await fetchOrder(id));
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (status === 'loading') {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
          <Skeleton className="h-[460px]" />
          <Skeleton className="h-[460px]" />
        </div>
      </div>
    );
  }

  if (status === 'error' || !order) {
    return (
      <div className="space-y-4">
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-bamboo-600 hover:text-sindoor-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to orders
        </Link>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          {error || 'Order not found'}
        </div>
      </div>
    );
  }

  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const forward = currentIndex >= 0 ? STATUS_FLOW.slice(currentIndex + 1) : [];
  const canCancel = ['placed', 'confirmed', 'packed'].includes(order.status);
  const canChange = forward.length > 0 || canCancel;
  const options = [...forward, ...(canCancel ? ['cancelled'] : [])];
  const activeNext = nextStatus || options[0] || '';
  const history = [...(order.statusHistory || [])].reverse();

  const applyStatus = async () => {
    if (!activeNext) return;
    setSaving(true);
    try {
      const updated = await updateOrderStatus(order._id, activeNext, note.trim() || undefined);
      setOrder(updated);
      setNextStatus('');
      setNote('');
      toast.success(`Order marked ${ORDER_STATUS[activeNext]?.label || activeNext}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <Seo title={`Order ${order.orderNumber}`} description="Manage a KHARNA order" noIndex />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-bamboo-600 hover:text-sindoor-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to orders
          </Link>
          <h1 className="mt-1 font-display text-3xl text-ink">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-bamboo-700">
            Placed {formatDateTime(order.createdAt)} · {order.items.length} line
            {order.items.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={STATUS_TONE[order.status] || 'sun'}>
            {ORDER_STATUS[order.status]?.label || order.status}
          </Badge>
          <Badge tone={PAYMENT_TONE[order.paymentStatus] || 'sun'}>
            {order.paymentMethod.toUpperCase()} · {order.paymentStatus}
          </Badge>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <section className="card-warm overflow-hidden">
            <h2 className="border-b border-sun-200/80 px-5 py-4 font-display text-xl text-ink">
              Sarees in this order
            </h2>
            <ul className="divide-y divide-sun-100">
              {order.items.map((item, index) => (
                <li key={`${item.slug}-${index}`} className="flex gap-4 px-5 py-4">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt=""
                      className="h-20 w-16 shrink-0 rounded-xl object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="h-20 w-16 shrink-0 rounded-xl bg-sun-100" aria-hidden="true" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink">{item.name}</p>
                    <p className="mt-0.5 text-xs text-bamboo-600">
                      {item.fabric} · {item.size} · Qty {item.qty}
                    </p>
                    <p className="mt-1 text-sm text-bamboo-800">{formatINR(item.price)} each</p>
                  </div>
                  <p className="text-sm font-medium text-ink">
                    {formatINR(item.price * item.qty)}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="card-warm p-5">
            <h2 className="font-display text-xl text-ink">Payment summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-bamboo-700">Items</dt>
                <dd className="text-ink">{formatINR(order.itemsTotal)}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-bamboo-700">
                    Discount {order.couponCode ? `(${order.couponCode})` : ''}
                  </dt>
                  <dd className="text-emerald-700">− {formatINR(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-bamboo-700">Delivery</dt>
                <dd className="text-ink">
                  {order.shippingFee > 0 ? formatINR(order.shippingFee) : 'Free'}
                </dd>
              </div>
              <div className="flex justify-between border-t border-sun-200 pt-2 text-base font-medium">
                <dt className="text-ink">Total</dt>
                <dd className="text-ink">{formatINR(order.total)}</dd>
              </div>
            </dl>
            {order.razorpayPaymentId && (
              <p className="mt-3 break-all text-[11px] text-bamboo-600">
                Razorpay payment: {order.razorpayPaymentId}
              </p>
            )}
          </section>

          <section className="card-warm p-5">
            <h2 className="font-display text-xl text-ink">Status history</h2>
            <ul className="mt-3 space-y-3">
              {history.map((entry, index) => (
                <li key={`${entry.status}-${index}`} className="flex gap-3 text-sm">
                  <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-flame-500"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-medium text-ink">
                      {ORDER_STATUS[entry.status]?.label || entry.status}
                    </p>
                    <p className="text-xs text-bamboo-600">
                      {formatDateTime(entry.at)}
                      {entry.note ? ` · ${entry.note}` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="card-warm p-5">
            <h2 className="font-display text-xl text-ink">Move the order</h2>
            {canChange ? (
              <div className="mt-4 space-y-3">
                <div>
                  <label htmlFor="next-status" className="label-base">
                    New status
                  </label>
                  <select
                    id="next-status"
                    value={activeNext}
                    onChange={(event) => setNextStatus(event.target.value)}
                    className="input-base"
                  >
                    {options.map((option) => (
                      <option key={option} value={option}>
                        {ORDER_STATUS[option]?.label || option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="status-note" className="label-base">
                    Note for the customer
                  </label>
                  <textarea
                    id="status-note"
                    rows={2}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    className="input-base"
                    placeholder="Handed to Delhivery, AWB 1234…"
                    maxLength={200}
                  />
                </div>
                <Button
                  size="sm"
                  onClick={applyStatus}
                  loading={saving}
                  className={cx('w-full', activeNext === 'cancelled' && 'bg-red-700 hover:bg-red-800')}
                >
                  {activeNext === 'cancelled' ? 'Cancel this order' : 'Update status'}
                </Button>
                {activeNext === 'cancelled' && order.paymentStatus === 'paid' && (
                  <p className="text-xs leading-relaxed text-sindoor-700">
                    This order is paid. Cancelling marks the payment as refunded — complete the
                    refund in Razorpay separately.
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-bamboo-600">
                A {order.status} order can no longer be changed.
              </p>
            )}
          </section>

          <section className="card-warm p-5">
            <h2 className="font-display text-xl text-ink">Customer</h2>
            <div className="mt-3 space-y-2 text-sm text-bamboo-800">
              <p className="flex items-center gap-2">
                <User className="h-4 w-4 text-flame-600" aria-hidden="true" />
                {order.user?.name || order.shippingAddress.fullName}
              </p>
              {order.user?.email && <p className="pl-6 text-xs text-bamboo-600">{order.user.email}</p>}
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-flame-600" aria-hidden="true" />
                {order.shippingAddress.phone || order.user?.phone || '—'}
              </p>
            </div>

            <h3 className="mt-5 flex items-center gap-2 font-display text-lg text-ink">
              <MapPin className="h-4 w-4 text-flame-600" aria-hidden="true" />
              Shipping address
            </h3>
            <address className="mt-1 pl-6 text-sm not-italic leading-relaxed text-bamboo-800">
              {order.shippingAddress.fullName}
              <br />
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 ? (
                <>
                  <br />
                  {order.shippingAddress.line2}
                </>
              ) : null}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
              {order.shippingAddress.pincode}
            </address>
          </section>

          <section className="card-warm p-5">
            <h2 className="font-display text-xl text-ink">Progress</h2>
            <div className="mt-4">
              <OrderStatusTimeline order={order} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
