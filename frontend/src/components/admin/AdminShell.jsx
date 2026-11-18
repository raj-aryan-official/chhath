import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Tags,
  Ticket,
  Users,
} from 'lucide-react';
import KharnaLogo from '../brand/KharnaLogo.jsx';
import Drawer from '../ui/Drawer.jsx';
import AnimatedOutlet from '../layout/AnimatedOutlet.jsx';
import { logout } from '../../store/slices/authSlice.js';
import { cx } from '../../utils/format.js';

const LINKS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Sarees', icon: ShoppingBag },
  { to: '/admin/categories', label: 'Collections', icon: Tags },
  { to: '/admin/orders', label: 'Orders', icon: Package },
  { to: '/admin/users', label: 'Customers', icon: Users },
  { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { to: '/admin/settings', label: 'Store settings', icon: Settings },
];

function NavList({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Admin">
      {LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cx(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
              isActive
                ? 'bg-flame-600 text-white shadow-warm'
                : 'text-bamboo-800 hover:bg-sun-100 hover:text-sindoor-700'
            )
          }
        >
          <link.icon className="h-4 w-4" aria-hidden="true" />
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function AdminShell() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMenuOpen(false);
    await dispatch(logout());
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#FBF1DF]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sun-200 bg-cream lg:flex">
        <div className="border-b border-sun-200/80 px-5 py-5">
          <KharnaLogo to="/admin" markClassName="h-9 w-9" />
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-flame-700">
            Store studio
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <NavList />
        </div>

        <div className="space-y-1 border-t border-sun-200/80 px-3 py-4">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-bamboo-800 transition hover:bg-sun-100"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            View storefront
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-sindoor-700 transition hover:bg-flame-50"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
          <p className="px-3 pt-2 text-xs text-bamboo-600">
            Signed in as <span className="font-medium text-ink">{user?.name}</span>
          </p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-sun-200 bg-cream/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-bamboo-800 transition hover:bg-sun-100 lg:hidden"
              aria-label="Open admin menu"
              aria-expanded={menuOpen}
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="font-display text-lg text-ink lg:hidden">Kharna Studio</p>
            <p className="hidden text-xs uppercase tracking-[0.24em] text-bamboo-600 lg:block">
              {user?.email}
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-sun-300 bg-white px-3.5 py-2 text-xs font-medium text-bamboo-800 transition hover:border-flame-500 hover:text-sindoor-700"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            View store
          </Link>
        </header>

        <main id="main-content" className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <AnimatedOutlet />
        </main>
      </div>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} side="left" title="Admin menu">
        <div className="space-y-6">
          <NavList onNavigate={() => setMenuOpen(false)} />
          <div className="space-y-1 border-t border-sun-200 pt-4">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-bamboo-800 transition hover:bg-sun-100"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              View storefront
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-sindoor-700 transition hover:bg-flame-50"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
