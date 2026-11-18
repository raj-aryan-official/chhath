import { lazy } from 'react';

const loaders = {
  Home: () => import('../pages/Home.jsx'),
  Shop: () => import('../pages/Shop.jsx'),
  ProductDetail: () => import('../pages/ProductDetail.jsx'),
  Cart: () => import('../pages/Cart.jsx'),
  Checkout: () => import('../pages/Checkout.jsx'),
  OrderSuccess: () => import('../pages/OrderSuccess.jsx'),
  MyOrders: () => import('../pages/MyOrders.jsx'),
  OrderDetail: () => import('../pages/OrderDetail.jsx'),
  Login: () => import('../pages/Login.jsx'),
  Register: () => import('../pages/Register.jsx'),
  ForgotPassword: () => import('../pages/ForgotPassword.jsx'),
  ResetPassword: () => import('../pages/ResetPassword.jsx'),
  Profile: () => import('../pages/Profile.jsx'),
  Wishlist: () => import('../pages/Wishlist.jsx'),
  About: () => import('../pages/About.jsx'),
  Contact: () => import('../pages/Contact.jsx'),
  Faq: () => import('../pages/Faq.jsx'),
  ShippingReturns: () => import('../pages/ShippingReturns.jsx'),
  Privacy: () => import('../pages/Privacy.jsx'),
  Terms: () => import('../pages/Terms.jsx'),
  NotFound: () => import('../pages/NotFound.jsx'),
  AdminDashboard: () => import('../pages/admin/AdminDashboard.jsx'),
  AdminProducts: () => import('../pages/admin/AdminProducts.jsx'),
  AdminProductForm: () => import('../pages/admin/AdminProductForm.jsx'),
  AdminCategories: () => import('../pages/admin/AdminCategories.jsx'),
  AdminOrders: () => import('../pages/admin/AdminOrders.jsx'),
  AdminOrderDetail: () => import('../pages/admin/AdminOrderDetail.jsx'),
  AdminUsers: () => import('../pages/admin/AdminUsers.jsx'),
  AdminCoupons: () => import('../pages/admin/AdminCoupons.jsx'),
  AdminSettings: () => import('../pages/admin/AdminSettings.jsx'),
};

const cache = new Map();

const load = (name) => {
  if (!cache.has(name)) cache.set(name, loaders[name]());
  return cache.get(name);
};

export const lazyPage = (name) => lazy(() => load(name));

const ROUTE_LOADERS = [
  { match: (path) => path === '/', name: 'Home' },
  { match: (path) => path === '/shop', name: 'Shop' },
  { match: (path) => path.startsWith('/product/'), name: 'ProductDetail' },
  { match: (path) => path === '/cart', name: 'Cart' },
  { match: (path) => path === '/checkout', name: 'Checkout' },
  { match: (path) => path.startsWith('/order-success'), name: 'OrderSuccess' },
  { match: (path) => path === '/account/orders', name: 'MyOrders' },
  { match: (path) => path.startsWith('/account/orders/'), name: 'OrderDetail' },
  { match: (path) => path === '/account/profile', name: 'Profile' },
  { match: (path) => path === '/wishlist', name: 'Wishlist' },
  { match: (path) => path === '/login', name: 'Login' },
  { match: (path) => path === '/register', name: 'Register' },
  { match: (path) => path === '/forgot-password', name: 'ForgotPassword' },
  { match: (path) => path.startsWith('/reset-password'), name: 'ResetPassword' },
  { match: (path) => path === '/about', name: 'About' },
  { match: (path) => path === '/contact', name: 'Contact' },
  { match: (path) => path === '/faq', name: 'Faq' },
  { match: (path) => path === '/shipping-returns', name: 'ShippingReturns' },
  { match: (path) => path === '/privacy', name: 'Privacy' },
  { match: (path) => path === '/terms', name: 'Terms' },
  {
    match: (path) => path === '/admin/products/new' || /^\/admin\/products\/[^/]+\/edit$/.test(path),
    name: 'AdminProductForm',
  },
  { match: (path) => path === '/admin/products', name: 'AdminProducts' },
  { match: (path) => /^\/admin\/orders\/[^/]+$/.test(path), name: 'AdminOrderDetail' },
  { match: (path) => path === '/admin/orders', name: 'AdminOrders' },
  { match: (path) => path === '/admin/categories', name: 'AdminCategories' },
  { match: (path) => path === '/admin/users', name: 'AdminUsers' },
  { match: (path) => path === '/admin/coupons', name: 'AdminCoupons' },
  { match: (path) => path === '/admin/settings', name: 'AdminSettings' },
  { match: (path) => path === '/admin', name: 'AdminDashboard' },
];

export function preloadRoute(path) {
  if (!path) return;
  const route = ROUTE_LOADERS.find((entry) => entry.match(path));
  if (route) load(route.name).catch(() => {});
}
