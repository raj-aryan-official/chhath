import { api } from './api.js';

export const fetchStats = async () => {
  const { data } = await api.get('/admin/stats');
  return data.data;
};

export const fetchAdminProducts = async (params) => {
  const { data } = await api.get('/admin/products', { params });
  return data.data;
};

export const createProduct = async (payload) => {
  const { data } = await api.post('/admin/products', payload);
  return data.data.product;
};

export const updateProduct = async (id, payload) => {
  const { data } = await api.patch(`/admin/products/${id}`, payload);
  return data.data.product;
};

export const deleteProduct = async (id) => {
  const { data } = await api.delete(`/admin/products/${id}`);
  return data;
};

export const createCategory = async (payload) => {
  const { data } = await api.post('/admin/categories', payload);
  return data.data.category;
};

export const updateCategory = async (id, payload) => {
  const { data } = await api.patch(`/admin/categories/${id}`, payload);
  return data.data.category;
};

export const deleteCategory = async (id) => {
  const { data } = await api.delete(`/admin/categories/${id}`);
  return data;
};

export const fetchAdminOrders = async (params) => {
  const { data } = await api.get('/admin/orders', { params });
  return data.data;
};

export const updateOrderStatus = async (id, status, note) => {
  const { data } = await api.patch(`/admin/orders/${id}/status`, { status, note });
  return data.data.order;
};

export const fetchAdminUsers = async (params) => {
  const { data } = await api.get('/admin/users', { params });
  return data.data;
};

export const fetchCoupons = async () => {
  const { data } = await api.get('/admin/coupons');
  return data.data.coupons;
};

export const createCoupon = async (payload) => {
  const { data } = await api.post('/admin/coupons', payload);
  return data.data.coupon;
};

export const updateCoupon = async (id, payload) => {
  const { data } = await api.patch(`/admin/coupons/${id}`, payload);
  return data.data.coupon;
};

export const deleteCoupon = async (id) => {
  const { data } = await api.delete(`/admin/coupons/${id}`);
  return data;
};

export const updateSettings = async (payload) => {
  const { data } = await api.put('/admin/settings', payload);
  return data.data.settings;
};

export const uploadImages = async (files) => {
  const form = new FormData();
  Array.from(files).forEach((file) => form.append('images', file));
  const { data } = await api.post('/admin/uploads', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data.urls;
};
