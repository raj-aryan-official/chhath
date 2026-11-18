import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import Drawer from '../ui/Drawer.jsx';
import Button from '../ui/Button.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import CartLine from './CartLine.jsx';
import { closeCart } from '../../store/slices/uiSlice.js';
import { selectCartTotals } from '../../store/slices/cartSlice.js';
import { formatINR } from '../../utils/format.js';
import { useT } from '../../i18n/useT.js';

export default function CartDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useT();
  const open = useSelector((state) => state.ui.cartOpen);
  const items = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.auth.user);
  const totals = useSelector(selectCartTotals);

  const close = () => dispatch(closeCart());
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const progress = Math.min(100, Math.round((totals.itemsTotal / totals.freeThreshold) * 100));

  const go = (path) => {
    close();
    navigate(path);
  };

  return (
    <Drawer
      open={open}
      onClose={close}
      title={count ? t('cart.countTitle', { count }) : t('cart.title')}
      footer={
        items.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-bamboo-700">{t('cart.subtotal')}</span>
              <span className="font-semibold text-ink">{formatINR(totals.itemsTotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-bamboo-700">{t('cart.delivery')}</span>
              <span className="font-medium text-ink">
                {totals.shippingFee === 0 ? t('cart.free') : formatINR(totals.shippingFee)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-sun-200 pt-3">
              <span className="font-display text-lg text-ink">{t('cart.total')}</span>
              <span className="font-display text-lg text-ink">{formatINR(totals.total)}</span>
            </div>
            <Button className="w-full" onClick={() => go('/checkout')}>
              {user ? t('cart.proceed') : t('cart.signInToCheckout')}
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => go('/cart')}>
              {t('cart.viewBag')}
            </Button>
            <p className="text-center text-[11px] text-bamboo-600">{t('cart.taxesNote')}</p>
          </div>
        ) : null
      }
    >
      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title={t('cart.drawerEmptyTitle')}
          description={t('cart.drawerEmptyCopy')}
          action={
            <Button onClick={() => go('/shop')} variant="primary">
              {t('cart.emptyAction')}
            </Button>
          }
          className="border-0 bg-transparent py-10"
        />
      ) : (
        <div className="space-y-5">
          <div className="rounded-2xl bg-sun-100/70 p-3.5">
            <p className="text-xs text-bamboo-800">
              {totals.remainingForFree > 0
                ? t('cart.freeProgress', { amount: formatINR(totals.remainingForFree) })
                : t('cart.freeUnlocked')}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sun-400 to-flame-500 transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="space-y-5 divide-y divide-sun-200/70">
            {items.map((item) => (
              <div key={item.key} className="pt-5 first:pt-0">
                <CartLine item={item} compact onNavigate={close} />
              </div>
            ))}
          </div>
        </div>
      )}
    </Drawer>
  );
}
