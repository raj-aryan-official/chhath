import { Route, Routes } from 'react-router-dom';
import StoreLayout from '../components/layout/StoreLayout.jsx';
import AdminShell from '../components/admin/AdminShell.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import { lazyPage } from './lazyPages.js';

const Home = lazyPage('Home');
const Shop = lazyPage('Shop');
const ProductDetail = lazyPage('ProductDetail');
const Cart = lazyPage('Cart');
const Checkout = lazyPage('Checkout');
const OrderSuccess = lazyPage('OrderSuccess');
const MyOrders = lazyPage('MyOrders');
const OrderDetail = lazyPage('OrderDetail');
const Login = lazyPage('Login');
const Register = lazyPage('Register');
const ForgotPassword = lazyPage('ForgotPassword');
const ResetPassword = lazyPage('ResetPassword');
const Profile = lazyPage('Profile');
const Wishlist = lazyPage('Wishlist');
const About = lazyPage('About');
const Contact = lazyPage('Contact');
const Faq = lazyPage('Faq');
const ShippingReturns = lazyPage('ShippingReturns');
const Privacy = lazyPage('Privacy');
const Terms = lazyPage('Terms');
const NotFound = lazyPage('NotFound');

const AdminDashboard = lazyPage('AdminDashboard');
const AdminProducts = lazyPage('AdminProducts');
const AdminProductForm = lazyPage('AdminProductForm');
const AdminCategories = lazyPage('AdminCategories');
const AdminOrders = lazyPage('AdminOrders');
const AdminOrderDetail = lazyPage('AdminOrderDetail');
const AdminUsers = lazyPage('AdminUsers');
const AdminCoupons = lazyPage('AdminCoupons');
const AdminSettings = lazyPage('AdminSettings');

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<StoreLayout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="product/:slug" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="faq" element={<Faq />} />
        <Route path="shipping-returns" element={<ShippingReturns />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />

        <Route element={<ProtectedRoute />}>
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-success/:id" element={<OrderSuccess />} />
          <Route path="account/orders" element={<MyOrders />} />
          <Route path="account/orders/:id" element={<OrderDetail />} />
          <Route path="account/profile" element={<Profile />} />
          <Route path="wishlist" element={<Wishlist />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<ProtectedRoute adminOnly />}>
        <Route path="admin" element={<AdminShell />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:slug/edit" element={<AdminProductForm />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>
    </Routes>
  );
}
