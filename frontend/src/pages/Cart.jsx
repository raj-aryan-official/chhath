import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowRight, RotateCcw, ShieldCheck, ShoppingBag } from 'lucide-react';
import Seo from '../components/seo/Seo.jsx';
import CartLine from '../components/cart/CartLine.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { selectCartTotals } from '../store/slices/cartSlice.js';
import { formatINR } from '../utils/format.js';
import { useT } from '../i18n/useT.js';

export default function Cart() {
  const { t } = useT();
  const items = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.auth.user);
  const totals = useSelector(selectCartTotals);

  const progress = Math.min(100, Math.round((totals.itemsTotal / totals.freeThreshold) * 100));

  return (
    <>
      <Seo
        title={t('cart.seoTitle')}
        description={items.length ? t('cart.seoDescription') : t('cart.seoEmptyDescription')}
        path="/cart"
        noIndex
      />

      <div className="container-page py-10">
        <nav aria-label="Breadcrumb" className="text-[11px] text-bamboo-600">
          <Link to="/" className="hover:text-sindoor-700">{t('cart.breadcrumbHome')}</Link>
          <span className="mx-1.5" aria-hidden="true">/</span>
          <span className="font-medium text-bamboo-800">{t('cart.breadcrumbBag')}</span>
        </nav>

        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="font-display text-3xl text-ink sm:text-4xl">{t('cart.title')}</h1>
          {items.length > 0 && (
            <p className="text-sm text-bamboo-600">
              {t('cart.held', { count: items.reduce((sum, item) => sum + item.qty, 0) })}
            </p>
          )}
        </div>

        {items.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={ShoppingBag}
              title={t('cart.emptyTitle')}
              description={t('cart.emptyDescription')}
              action={<Button to="/shop">{t('cart.emptyAction')}</Button>}
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
            <div className="space-y-4">
              <div className="rounded-2xl border border-sun-200 bg-white/80 p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-bamboo-800">
                    {totals.remainingForFree > 0
                      ? t('cart.freeProgress', { amount: formatINR(totals.remainingForFree) })
                      : t('cart.freeUnlocked')}
                  </p>
                  <span className="text-[11px] text-bamboo-600">
                    {t('cart.freeAbove', { amount: formatINR(totals.freeThreshold) })}
                  </span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-sun-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sun-400 to-flame-500 transition-[width]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="divide-y divide-sun-200/70 rounded-2xl border border-sun-200 bg-white/80 p-5">
                {items.map((item) => (
                  <div key={item.key} className="py-5 first:pt-0 last:pb-0">
                    <CartLine item={item} />
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button to="/shop" variant="ghost">
                  {t('cart.continueShopping')}
                </Button>
                <Link
                  to="/shop?sort=newest"
                  className="inline-flex items-center gap-1 text-xs font-medium text-sindoor-700 hover:underline"
                >
                  {t('cart.newArrivals')}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <aside className="sticky top-24 rounded-2xl border border-sun-200 bg-white/90 p-5 shadow-warm">
              <h2 className="font-display text-xl text-ink">{t('cart.summary')}</h2>

              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-bamboo-700">{t('cart.items')}</dt>
                  <dd className="font-medium text-ink">{formatINR(totals.itemsTotal)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-bamboo-700">{t('cart.delivery')}</dt>
                  <dd className="font-medium text-ink">
                    {totals.shippingFee === 0 ? t('cart.free') : formatINR(totals.shippingFee)}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-sun-200 pt-3">
                  <dt className="font-display text-lg text-ink">{t('cart.total')}</dt>
                  <dd className="font-display text-lg text-ink">{formatINR(totals.total)}</dd>
                </div>
              </dl>

              <Button to={user ? '/checkout' : '/login'} className="mt-5 w-full" size="lg">
                {user ? t('cart.proceed') : t('cart.signInToCheckout')}
              </Button>
              {!user && (
                <p className="mt-2 text-center text-[11px] text-bamboo-600">{t('cart.savedNote')}</p>
              )}

              <ul className="mt-5 space-y-2 border-t border-sun-200 pt-4 text-[11px] text-bamboo-700">
                <li className="flex items-center gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5 text-flame-600" aria-hidden="true" />
                  {t('cart.returnsNote')}
                </li>
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-flame-600" aria-hidden="true" />
                  {t('cart.secureNote')}
                </li>
              </ul>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
