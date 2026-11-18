import { api } from './api.js';

export const createOrder = async (payload) => {
  const { data } = await api.post('/orders', payload);
  return data.data.order;
};

export const fetchMyOrders = async (params) => {
  const { data } = await api.get('/orders', { params });
  return data.data;
};

export const fetchOrder = async (id) => {
  const { data } = await api.get(`/orders/${id}`);
  return data.data.order;
};

export const cancelOrder = async (id) => {
  const { data } = await api.post(`/orders/${id}/cancel`);
  return data.data.order;
};

export const createPaymentOrder = async (orderId) => {
  const { data } = await api.post('/payments/order', { orderId });
  return data.data;
};

export const verifyPayment = async (payload) => {
  const { data } = await api.post('/payments/verify', payload);
  return data.data.order;
};

export const validateCoupon = async (code) => {
  const { data } = await api.post('/coupons/validate', { code });
  return data.data;
};
