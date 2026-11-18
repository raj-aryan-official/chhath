import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Check,
  CreditCard,
  Info,
  MapPin,
  Plus,
  ShieldCheck,
  Tag,
  Wallet,
  X,
} from 'lucide-react';
import Seo from '../components/seo/Seo.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import LazyImage from '../components/ui/LazyImage.jsx';
import { selectCartTotals } from '../store/slices/cartSlice.js';
import { clearAll } from '../store/slices/cartSlice.js';
import { saveAddress } from '../store/slices/authSlice.js';
import {
  createOrder,
  createPaymentOrder,
  validateCoupon,
  verifyPayment,
} from '../services/order.service.js';
import { loadRazorpayScript } from '../utils/razorpay.js';
import { toast } from '../store/index.js';
import { formatINR, cx } from '../utils/format.js';
import { useT } from '../i18n/useT.js';
import { useLocalized } from '../i18n/useLocalized.js';

const makeAddressSchema = (t) =>
  z.object({
    fullName: z.string().trim().min(2, t('checkout.validation.fullName')).max(80),
    line1: z.string().trim().min(4, t('checkout.validation.line1')).max(160),
    line2: z.string().trim().max(160).optional().or(z.literal('')),
    city: z.string().trim().min(2, t('checkout.validation.city')).max(80),
    state: z.string().trim().min(2, t('checkout.validation.state')).max(80),
    pincode: z.string().regex(/^\d{6}$/, t('checkout.validation.pincode')),
    phone: z.string().regex(/^[6-9]\d{9}$/, t('checkout.validation.phone')),
  });

function AddressSummary({ address, selected, onSelect }) {
  const { t } = useT();
  return (
    <label
      className={cx(
        'flex cursor-pointer gap-3 rounded-2xl border p-4 transition',
        selected
          ? 'border-flame-600 bg-flame-50/70 shadow-[0_8px_20px_-16px_rgba(234,88,12,0.7)]'
          : 'border-sun-200 bg-white/80 hover:border-flame-300'
      )}
    >
      <input
        type="radio"
        name="address"
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />
      <span
        className={cx(
          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
          selected ? 'border-flame-600 bg-flame-600 text-white' : 'border-sun-400 bg-white'
        )}
        aria-hidden="true"
      >
        {selected && <Check className="h-2.5 w-2.5" />}
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-ink">{address.fullName}</span>
          {address.label && (
            <span className="rounded-full bg-sun-100 px-2 py-0.5 text-[10px] font-medium text-bamboo-700">
              {address.label}
            </span>
          )}
          {address.isDefault && (
            <span className="rounded-full bg-sindoor-700/10 px-2 py-0.5 text-[10px] font-medium text-sindoor-700">
              {t('checkout.defaultBadge')}
            </span>
          )}
        </span>
        <span className="mt-1 block text-xs leading-relaxed text-bamboo-700">
          {[address.line1, address.line2, address.city, address.state, address.pincode]
            .filter(Boolean)
            .join(', ')}
        </span>
        <span className="mt-1 block text-[11px] text-bamboo-600">{address.phone}</span>
      </span>
    </label>
  );
}

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useT();
  const { pick } = useLocalized();
  const user = useSelector((state) => state.auth.user);
  const items = useSelector((state) => state.cart.items);
  const totals = useSelector(selectCartTotals);
  const settings = useSelector((state) => state.settings.settings);
  const payments = useSelector((state) => state.settings.payments);

  const savedAddresses = user?.addresses || [];
  const [selectedAddress, setSelectedAddress] = useState(() => {
    const initial = savedAddresses.find((address) => address.isDefault) || savedAddresses[0];
    return initial?._id || 'new';
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [saveNewAddress, setSaveNewAddress] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(makeAddressSchema(t)),
    defaultValues: {
      fullName: user?.name || '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      phone: user?.phone || '',
    },
  });

  const usingNewAddress = selectedAddress === 'new';
  const razorpayEnabled = Boolean(payments?.razorpayEnabled);

  useEffect(() => {
    if (!razorpayEnabled && paymentMethod === 'razorpay') setPaymentMethod('cod');
  }, [razorpayEnabled, paymentMethod]);

  const discount = coupon?.discount || 0;
  const shippingFee =
    items.length === 0 || totals.itemsTotal - discount >= totals.freeThreshold
      ? 0
      : settings?.shippingFee ?? totals.shippingFee;
  const grandTotal = Math.max(0, totals.itemsTotal - discount + shippingFee);

  const applyCoupon = async (event) => {
    event.preventDefault();
    const code = couponInput.trim();
    if (!code) return;
    setApplyingCoupon(true);
    setCouponError('');
    try {
      const result = await validateCoupon(code);
      setCoupon(result);
      setCouponInput(result.code);
      toast.success(t('checkout.couponSuccess', { code: result.code }));
    } catch (requestError) {
      setCoupon(null);
      setCouponError(requestError.message || t('checkout.couponError'));
    } finally {
      setApplyingCoupon(false);
    }
  };

  const placeOrder = async (formValues = {}) => {
    if (placing) return;
    setPlacing(true);
    let createdOrder = null;

    const addressPayload = usingNewAddress
      ? {
          ...formValues,
          line2: formValues.line2 || '',
        }
      : undefined;

    try {
      const order = await createOrder({
        items: items.map((item) => ({ product: item.productId, size: item.size, qty: item.qty })),
        paymentMethod,
        ...(coupon?.code ? { couponCode: coupon.code } : {}),
        ...(usingNewAddress ? { address: addressPayload } : { addressId: selectedAddress }),
      });
      createdOrder = order;

      if (usingNewAddress && saveNewAddress && addressPayload) {
        dispatch(saveAddress(addressPayload)).catch(() => {});
      }

      if (paymentMethod === 'razorpay') {
        let Razorpay;
        try {
          Razorpay = await loadRazorpayScript();
        } catch (scriptError) {
          toast.error(scriptError.message);
          dispatch(clearAll());
          navigate(`/account/orders/${order._id}`, { replace: true });
          return;
        }

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
              toast.success(t('checkout.toasts.confirmed'));
              dispatch(clearAll());
              navigate(`/order-success/${order._id}`, { replace: true });
            } catch (verifyError) {
              toast.error(verifyError.message || t('checkout.toasts.verifyError'));
              navigate(`/account/orders/${order._id}`, { replace: true });
            } finally {
              setPlacing(false);
            }
          },
          modal: {
            ondismiss: () => {
              setPlacing(false);
              dispatch(clearAll());
              toast.info(t('checkout.toasts.closed'));
              navigate(`/account/orders/${order._id}`, { replace: true });
            },
          },
        });

        checkout.on('payment.failed', (response) => {
          toast.error(response?.error?.description || t('checkout.toasts.failed'));
        });

        checkout.open();
        return;
      }

      dispatch(clearAll());
      toast.success(t('checkout.toasts.placed'));
      navigate(`/order-success/${order._id}`, { replace: true });
    } catch (requestError) {
      toast.error(requestError.message || t('checkout.toasts.placeError'));
      if (createdOrder) {
        dispatch(clearAll());
        navigate(`/account/orders/${createdOrder._id}`, { replace: true });
      }
      setPlacing(false);
    }
  };

  const submit = (event) => {
    if (!usingNewAddress) {
      event.preventDefault();
      placeOrder();
      return;
    }
    return handleSubmit(placeOrder)(event);
  };

  if (items.length === 0) {
    return (
      <div className="container-page py-16">
        <Seo title={t('checkout.seoTitle')} noIndex path="/checkout" />
        <EmptyState
          icon={Wallet}
          title={t('checkout.emptyTitle')}
          description={t('checkout.emptyDescription')}
          action={<Button to="/shop">{t('checkout.emptyAction')}</Button>}
        />
      </div>
    );
  }

  return (
    <>
      <Seo
        title={t('checkout.seoTitle')}
        description={t('checkout.seoDescription')}
        path="/checkout"
        noIndex
      />

      <div className="container-page py-10">
        <nav aria-label="Breadcrumb" className="text-[11px] text-bamboo-600">
          <Link to="/cart" className="hover:text-sindoor-700">{t('checkout.breadcrumbBag')}</Link>
          <span className="mx-1.5" aria-hidden="true">/</span>
          <span className="font-medium text-bamboo-800">{t('checkout.breadcrumbCheckout')}</span>
        </nav>

        <h1 className="mt-3 font-display text-3xl text-ink sm:text-4xl">{t('checkout.title')}</h1>
        <p className="mt-1 text-sm text-bamboo-700">{t('checkout.subtitle')}</p>

        <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
          <div className="space-y-6">
            <section className="rounded-2xl border border-sun-200 bg-white/80 p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-display text-xl text-ink">
                  <MapPin className="h-5 w-5 text-flame-600" aria-hidden="true" />
                  {t('checkout.addressTitle')}
                </h2>
                {savedAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedAddress(usingNewAddress ? savedAddresses[0]._id : 'new')}
                    className="inline-flex items-center gap-1 text-xs font-medium text-sindoor-700 hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    {usingNewAddress ? t('checkout.useSaved') : t('checkout.newAddress')}
                  </button>
                )}
              </div>

              {savedAddresses.length > 0 && !usingNewAddress && (
                <div className="mt-4 grid gap-2.5" role="radiogroup" aria-label={t('checkout.savedAria')}>
                  {savedAddresses.map((address) => (
                    <AddressSummary
                      key={address._id}
                      address={address}
                      selected={selectedAddress === address._id}
                      onSelect={() => setSelectedAddress(address._id)}
                    />
                  ))}
                  {!usingNewAddress && (
                    <button
                      type="button"
                      onClick={() => setSelectedAddress('new')}
                      className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-sun-300 px-4 py-3 text-xs font-medium text-bamboo-700 transition hover:border-flame-400 hover:text-sindoor-700"
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                      {t('checkout.deliverNew')}
                    </button>
                  )}
                </div>
              )}

              {(usingNewAddress || savedAddresses.length === 0) && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="fullName" className="label-base">{t('checkout.fields.fullName')}</label>
                    <input id="fullName" autoComplete="name" className="input-base" {...register('fullName')} />
                    {errors.fullName && <p className="mt-1 text-xs text-red-700">{errors.fullName.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="line1" className="label-base">{t('checkout.fields.line1')}</label>
                    <input id="line1" autoComplete="address-line1" className="input-base" {...register('line1')} />
                    {errors.line1 && <p className="mt-1 text-xs text-red-700">{errors.line1.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="line2" className="label-base">{t('checkout.fields.line2')}</label>
                    <input id="line2" autoComplete="address-line2" className="input-base" {...register('line2')} />
                  </div>
                  <div>
                    <label htmlFor="city" className="label-base">{t('checkout.fields.city')}</label>
                    <input id="city" autoComplete="address-level2" className="input-base" {...register('city')} />
                    {errors.city && <p className="mt-1 text-xs text-red-700">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="state" className="label-base">{t('checkout.fields.state')}</label>
                    <input id="state" autoComplete="address-level1" className="input-base" {...register('state')} />
                    {errors.state && <p className="mt-1 text-xs text-red-700">{errors.state.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="pincode" className="label-base">{t('checkout.fields.pincode')}</label>
                    <input
                      id="pincode"
                      inputMode="numeric"
                      maxLength={6}
                      autoComplete="postal-code"
                      className="input-base"
                      {...register('pincode')}
                    />
                    {errors.pincode && <p className="mt-1 text-xs text-red-700">{errors.pincode.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="phone" className="label-base">{t('checkout.fields.phone')}</label>
                    <input
                      id="phone"
                      inputMode="numeric"
                      maxLength={10}
                      autoComplete="tel"
                      className="input-base"
                      {...register('phone')}
                    />
                    {errors.phone && <p className="mt-1 text-xs text-red-700">{errors.phone.message}</p>}
                  </div>
                  <label className="sm:col-span-2 flex items-center gap-2 text-xs text-bamboo-700">
                    <input type="checkbox" checked={saveNewAddress} onChange={(event) => setSaveNewAddress(event.target.checked)} />
                    {t('checkout.fields.saveAddress')}
                  </label>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-sun-200 bg-white/80 p-5">
              <h2 className="flex items-center gap-2 font-display text-xl text-ink">
                <CreditCard className="h-5 w-5 text-flame-600" aria-hidden="true" />
                {t('checkout.paymentTitle')}
              </h2>

              <div className="mt-4 grid gap-2.5" role="radiogroup" aria-label={t('checkout.paymentAria')}>
                <label
                  className={cx(
                    'flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition',
                    paymentMethod === 'cod'
                      ? 'border-flame-600 bg-flame-50/70'
                      : 'border-sun-200 bg-white/80 hover:border-flame-300'
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1 accent-flame-600"
                  />
                  <span className="flex-1">
                    <span className="flex items-center gap-2 text-sm font-medium text-ink">
                      <Wallet className="h-4 w-4 text-flame-700" aria-hidden="true" />
                      {t('checkout.cod')}
                    </span>
                    <span className="mt-0.5 block text-xs text-bamboo-600">{t('checkout.codCopy')}</span>
                  </span>
                </label>

                <label
                  className={cx(
                    'flex items-start gap-3 rounded-2xl border p-4 transition',
                    !razorpayEnabled && 'cursor-not-allowed opacity-60',
                    paymentMethod === 'razorpay'
                      ? 'border-flame-600 bg-flame-50/70'
                      : 'border-sun-200 bg-white/80',
                    razorpayEnabled && 'cursor-pointer hover:border-flame-300'
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => razorpayEnabled && setPaymentMethod('razorpay')}
                    disabled={!razorpayEnabled}
                    className="mt-1 accent-flame-600"
                  />
                  <span className="flex-1">
                    <span className="flex items-center gap-2 text-sm font-medium text-ink">
                      <ShieldCheck className="h-4 w-4 text-flame-700" aria-hidden="true" />
                      {t('checkout.online')}
                      <span className="rounded-full bg-sun-100 px-2 py-0.5 text-[10px] font-medium text-bamboo-700">
                        {t('checkout.onlineBadge')}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-xs text-bamboo-600">
                      {razorpayEnabled ? t('checkout.onlineCopy') : t('checkout.onlineDisabled')}
                    </span>
                  </span>
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-sun-200 bg-white/80 p-5">
              <h2 className="flex items-center gap-2 font-display text-xl text-ink">
                <Tag className="h-5 w-5 text-flame-600" aria-hidden="true" />
                {t('checkout.couponTitle')}
              </h2>

              {coupon ? (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-emerald-900">
                      {t('checkout.couponApplied', { code: coupon.code, amount: formatINR(coupon.discount) })}
                    </p>
                    {coupon.description && (
                      <p className="text-[11px] text-emerald-800/80">{coupon.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCoupon(null);
                      setCouponInput('');
                    }}
                    className="rounded-full p-1.5 text-emerald-800 transition hover:bg-emerald-100"
                    aria-label={t('checkout.removeCoupon')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={couponInput}
                    onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') applyCoupon(event);
                    }}
                    placeholder={t('checkout.couponPlaceholder')}
                    maxLength={30}
                    className="input-base flex-1 uppercase tracking-wide"
                    aria-label={t('checkout.couponAria')}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    loading={applyingCoupon}
                    onClick={applyCoupon}
                  >
                    {t('checkout.apply')}
                  </Button>
                </div>
              )}
              {couponError && <p className="mt-2 text-xs text-red-700">{couponError}</p>}
              <p className="mt-2 flex items-start gap-1.5 text-[11px] text-bamboo-600">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {t('checkout.couponHint')}
              </p>
            </section>
          </div>

          <aside className="sticky top-24 rounded-2xl border border-sun-200 bg-white/90 p-5 shadow-warm">
            <h2 className="font-display text-xl text-ink">{t('checkout.summaryTitle')}</h2>

            <ul className="mt-4 space-y-3 border-b border-sun-200 pb-4">
              {items.map((item) => (
                <li key={item.key} className="flex gap-3">
                  <div className="w-12 shrink-0 overflow-hidden rounded-lg border border-sun-200">
                    <LazyImage
                      src={item.image}
                      alt={pick(item, 'name')}
                      aspect="3 / 4"
                      width={96}
                      height={128}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-ink">{pick(item, 'name')}</p>
                    <p className="text-[11px] text-bamboo-600">
                      {t('checkout.qty', { size: item.size, qty: item.qty })}
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-ink">{formatINR(item.unitPrice * item.qty)}</p>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-bamboo-700">{t('checkout.items')}</dt>
                <dd className="font-medium text-ink">{formatINR(totals.itemsTotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-emerald-800">
                  <dt>{t('checkout.couponRow', { code: coupon.code })}</dt>
                  <dd className="font-medium">−{formatINR(discount)}</dd>
                </div>
              )}
              <div className="flex items-center justify-between">
                <dt className="text-bamboo-700">{t('checkout.delivery')}</dt>
                <dd className="font-medium text-ink">
                  {shippingFee === 0 ? t('checkout.free') : formatINR(shippingFee)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-sun-200 pt-3">
                <dt className="font-display text-lg text-ink">{t('checkout.total')}</dt>
                <dd className="font-display text-lg text-ink">{formatINR(grandTotal)}</dd>
              </div>
            </dl>

            <Button type="submit" size="lg" className="mt-5 w-full" loading={placing}>
              {paymentMethod === 'razorpay' ? t('checkout.paySecure') : t('checkout.placeCod')}
            </Button>
            <p className="mt-2 text-center text-[11px] leading-relaxed text-bamboo-600">
              {t('checkout.serverNote')}
            </p>
          </aside>
        </form>
      </div>
    </>
  );
}
