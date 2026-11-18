import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ChevronDown,
  Heart,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  User,
  UserCog,
} from 'lucide-react';
import KharnaLogo from '../brand/KharnaLogo.jsx';
import Drawer from '../ui/Drawer.jsx';
import LanguageToggle from './LanguageToggle.jsx';
import { logout } from '../../store/slices/authSlice.js';
import { openCart } from '../../store/slices/uiSlice.js';
import { selectCartCount } from '../../store/slices/cartSlice.js';
import { preloadRoute } from '../../routes/lazyPages.js';
import { useClickOutside } from '../../hooks/useClickOutside.js';
import { FABRICS } from '../../utils/constants.js';
import { cx } from '../../utils/format.js';
import { useT } from '../../i18n/useT.js';
import { useCatalogText } from '../../i18n/useCatalogText.js';

const prefetch = (path) => () => preloadRoute(path);

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const cartCount = useSelector(selectCartCount);
  const wishlistCount = useSelector((state) => state.wishlist.products.length);
  const settings = useSelector((state) => state.settings.settings);
  const { t, lang } = useT();
  const { fabricLabel } = useCatalogText();

  const navItems = [
    { to: '/shop', label: t('common.nav.shop') },
    { to: '/about', label: t('common.nav.ourStory') },
    { to: '/faq', label: t('common.nav.faq') },
    { to: '/contact', label: t('common.nav.contact') },
  ];

  const announcement =
    lang === 'hi'
      ? settings?.announcementHi || settings?.announcement
      : settings?.announcement || settings?.announcementHi;

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [fabricsOpen, setFabricsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const accountRef = useRef(null);
  const fabricsRef = useRef(null);
  const searchInputRef = useRef(null);

  useClickOutside(accountRef, () => setAccountOpen(false), accountOpen);
  useClickOutside(fabricsRef, () => setFabricsOpen(false), fabricsOpen);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const submitSearch = (event) => {
    event.preventDefault();
    const term = query.trim();
    setSearchOpen(false);
    setMenuOpen(false);
    navigate(term ? `/shop?q=${encodeURIComponent(term)}` : '/shop');
  };

  const handleLogout = async () => {
    setAccountOpen(false);
    setMenuOpen(false);
    await dispatch(logout());
    navigate('/');
  };

  const iconButton =
    'relative flex h-10 w-10 items-center justify-center rounded-full text-bamboo-800 transition hover:bg-sun-100 hover:text-sindoor-700';

  const badge = (count) =>
    count > 0 && (
      <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[18px] items-center justify-center rounded-full bg-sindoor-600 px-1 text-[10px] font-semibold text-white">
        {count > 9 ? '9+' : count}
      </span>
    );

  const accountLinks = user
    ? [
        { to: '/account/orders', label: t('common.nav.myOrders'), icon: Package },
        { to: '/account/profile', label: t('common.nav.profileAddresses'), icon: User },
        { to: '/wishlist', label: t('common.nav.wishlist'), icon: Heart },
        ...(user.role === 'admin'
          ? [{ to: '/admin', label: t('common.nav.adminPanel'), icon: UserCog }]
          : []),
      ]
    : [];

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-bamboo-900">
        <p className="container-page flex h-9 items-center justify-center gap-2 text-center text-[10px] font-light tracking-[0.16em] text-sun-100 sm:text-[11px]">
          <span className="h-1 w-1 shrink-0 rounded-full bg-flame-400 animate-glow-pulse" aria-hidden="true" />
          <span className="truncate">{announcement || t('common.announcement')}</span>
        </p>
      </div>

      <div
        className={cx(
          'border-b bg-cream/90 backdrop-blur-md transition-shadow',
          scrolled ? 'border-sun-300 shadow-soft' : 'border-sun-200/70'
        )}
      >
        <div className="container-page flex h-[68px] items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={cx(iconButton, 'lg:hidden')}
              onClick={() => setMenuOpen(true)}
              aria-label={t("common.nav.openMenu")}
              aria-expanded={menuOpen}
            >
              <Menu className="h-5 w-5" />
            </button>
            <KharnaLogo to="/" markClassName="h-9 w-9 sm:h-10 sm:w-10" />
          </div>

          <nav className="hidden items-center gap-8 lg:flex" aria-label={t("common.nav.main")}>
            {navItems.slice(0, 1).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onMouseEnter={prefetch(item.to)}
                onFocus={prefetch(item.to)}
                className={({ isActive }) =>
                  cx(
                    'link-underline py-2 text-[13px] font-medium tracking-wide text-bamboo-800',
                    isActive && 'text-sindoor-700'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div className="relative" ref={fabricsRef}>
              <button
                type="button"
                onClick={() => setFabricsOpen((open) => !open)}
                className="flex items-center gap-1 py-2 text-[13px] font-medium tracking-wide text-bamboo-800 transition hover:text-sindoor-700"
                aria-expanded={fabricsOpen}
                aria-haspopup="true"
              >
                Fabrics
                <ChevronDown
                  className={cx('h-3.5 w-3.5 transition-transform', fabricsOpen && 'rotate-180')}
                />
              </button>
              {fabricsOpen && (
                <div className="absolute left-1/2 top-full mt-2 w-64 -translate-x-1/2 rounded-2xl border border-sun-200 bg-cream p-2 shadow-warm">
                  {FABRICS.map((fabric) => (
                    <Link
                      key={fabricLabel(fabric.name)}
                      to={`/shop?fabric=${encodeURIComponent(fabric.name)}`}
                      onClick={() => setFabricsOpen(false)}
                      onMouseEnter={prefetch('/shop')}
                      className="block rounded-xl px-3 py-2 text-sm text-bamboo-800 transition hover:bg-sun-100"
                    >
                      {fabricLabel(fabric.name)}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navItems.slice(1).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onMouseEnter={prefetch(item.to)}
                onFocus={prefetch(item.to)}
                className={({ isActive }) =>
                  cx(
                    'link-underline py-2 text-[13px] font-medium tracking-wide text-bamboo-800',
                    isActive && 'text-sindoor-700'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              className={cx(iconButton, 'hidden sm:flex')}
              onClick={() => setSearchOpen((open) => !open)}
              aria-label={t("common.nav.searchSarees")}
              aria-expanded={searchOpen}
            >
              <Search className="h-5 w-5" />
            </button>

            <Link
              to="/wishlist"
              className={cx(iconButton, 'hidden sm:flex')}
              aria-label={`${t('common.nav.wishlistAria')}${wishlistCount ? `, ${t('common.nav.savedCount', { count: wishlistCount })}` : ''}`}
              onMouseEnter={prefetch('/wishlist')}
            >
              <Heart className="h-5 w-5" />
              {badge(wishlistCount)}
            </Link>

            <button
              type="button"
              className={iconButton}
              onClick={() => dispatch(openCart())}
              aria-label={`${t('common.nav.cartAria')}${cartCount ? `, ${t('common.nav.itemsInBag', { count: cartCount })}` : ''}`}
            >
              <ShoppingBag className="h-5 w-5" />
              {badge(cartCount)}
            </button>

            <LanguageToggle className="hidden md:inline-flex" />

            <div className="relative hidden md:block" ref={accountRef}>
              <button
                type="button"
                className={iconButton}
                onClick={() => setAccountOpen((open) => !open)}
                aria-label={t("common.nav.accountMenu")}
                aria-expanded={accountOpen}
                aria-haspopup="true"
              >
                <User className="h-5 w-5" />
              </button>
              {accountOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-sun-200 bg-cream p-2 shadow-warm">
                  {user ? (
                    <>
                      <div className="border-b border-sun-200/80 px-3 pb-2.5 pt-1">
                        <p className="text-sm font-medium text-ink">{user.name}</p>
                        <p className="truncate text-xs text-bamboo-600">{user.email}</p>
                      </div>
                      {accountLinks.map((link) => (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => setAccountOpen(false)}
                          className="mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-bamboo-800 transition hover:bg-sun-100"
                        >
                          <link.icon className="h-4 w-4" aria-hidden="true" />
                          {link.label}
                        </Link>
                      ))}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-sindoor-700 transition hover:bg-flame-50"
                      >
                        <LogOut className="h-4 w-4" aria-hidden="true" />
                        {t('common.nav.signOut')}
                      </button>
                    </>
                  ) : (
                    <div className="p-1">
                      <p className="px-2 py-1 text-xs text-bamboo-600">{t("common.nav.welcome")}</p>
                      <Link
                        to="/login"
                        onClick={() => setAccountOpen(false)}
                        className="mt-1 block rounded-xl bg-flame-600 px-3 py-2 text-center text-sm font-medium text-white transition hover:bg-flame-700"
                      >
                        {t('common.nav.signIn')}
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setAccountOpen(false)}
                        className="mt-1 block rounded-xl px-3 py-2 text-center text-sm text-bamboo-800 transition hover:bg-sun-100"
                      >
                        {t('common.nav.createAccount')}
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-sun-200/70 bg-cream">
            <form onSubmit={submitSearch} className="container-page flex items-center gap-3 py-3" role="search">
              <Search className="h-4 w-4 text-bamboo-600" aria-hidden="true" />
              <input
                ref={searchInputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("common.nav.searchPlaceholder")}
                className="w-full bg-transparent text-sm text-ink placeholder:text-bamboo-600/60 focus:outline-none"
                aria-label={t("common.nav.searchSarees")}
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-xs font-medium text-bamboo-600 hover:text-sindoor-700"
              >
                {t('common.actions.close')}
              </button>
            </form>
          </div>
        )}
      </div>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} side="left" title={t("common.nav.menu")}>
        <div className="space-y-6">
          <form onSubmit={submitSearch} className="flex items-center gap-2 rounded-full border border-sun-300 bg-white px-4 py-2.5">
            <Search className="h-4 w-4 text-bamboo-600" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("common.nav.searchSarees")}
              className="w-full bg-transparent text-sm focus:outline-none"
              aria-label={t("common.nav.searchSarees")}
            />
          </form>

          <div className="flex items-center justify-between rounded-xl bg-sun-50 px-3 py-2">
            <span className="text-xs font-medium text-bamboo-700">{t('common.language')}</span>
            <LanguageToggle full />
          </div>

          <nav className="flex flex-col gap-1" aria-label={t("common.nav.mobile")}>
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-bamboo-800 transition hover:bg-sun-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div>
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-sindoor-700">
              {t('common.nav.shopByFabric')}
            </p>
            <div className="mt-2 grid grid-cols-1 gap-0.5">
              {FABRICS.map((fabric) => (
                <Link
                  key={fabricLabel(fabric.name)}
                  to={`/shop?fabric=${encodeURIComponent(fabric.name)}`}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm text-bamboo-700 transition hover:bg-sun-100"
                >
                  {fabricLabel(fabric.name)}
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-sun-200 pt-4">
            {user ? (
              <div className="space-y-1">
                <p className="px-3 pb-1 text-sm font-medium text-ink">
                  {t('common.nav.namaste', { name: user.name.split(' ')[0] })}
                </p>
                {accountLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-bamboo-800 transition hover:bg-sun-100"
                  >
                    <link.icon className="h-4 w-4" aria-hidden="true" />
                    {link.label}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-sindoor-700 transition hover:bg-flame-50"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  {t('common.nav.signOut')}
                </button>
              </div>
            ) : (
              <div className="space-y-2 px-3">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-full bg-flame-600 px-4 py-2.5 text-center text-sm font-medium text-white"
                >
                  {t('common.nav.signIn')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-full border border-sun-300 px-4 py-2.5 text-center text-sm font-medium text-bamboo-800"
                >
                  {t('common.nav.createAccount')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </Drawer>
    </header>
  );
}
