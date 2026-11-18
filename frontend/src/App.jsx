import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CartDrawer from './components/cart/CartDrawer.jsx';
import ScrollToTop from './components/layout/ScrollToTop.jsx';
import Toaster from './components/ui/Toaster.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import { useT } from './i18n/useT.js';
import { fetchMe } from './store/slices/authSlice.js';
import { initCart } from './store/slices/cartSlice.js';
import { persistLanguage } from './store/slices/languageSlice.js';
import { loadSettings } from './store/slices/settingsSlice.js';
import { fetchWishlist } from './store/slices/wishlistSlice.js';

export default function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const authStatus = useSelector((state) => state.auth.status);
  const lang = useSelector((state) => state.language.lang);
  const { t } = useT();

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dataset.lang = lang;
    persistLanguage(lang);
  }, [lang]);

  useEffect(() => {
    dispatch(fetchMe());
    dispatch(loadSettings());
  }, [dispatch]);

  useEffect(() => {
    if (authStatus !== 'ready') return;
    dispatch(initCart());
    if (user) dispatch(fetchWishlist());
  }, [authStatus, user, dispatch]);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-full focus:bg-flame-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        {t('common.skipToContent')}
      </a>
      <ScrollToTop />
      <AppRoutes />
      <CartDrawer />
      <Toaster />
    </>
  );
}
