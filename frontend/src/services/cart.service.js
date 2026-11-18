import { api } from './api.js';

export const getCart = async () => {
  const { data } = await api.get('/cart');
  return data.data.cart;
};

export const addToCart = async ({ productId, size, qty }) => {
  const { data } = await api.post('/cart', { product: productId, size, qty });
  return data.data.cart;
};

export const updateCartItem = async (itemId, qty) => {
  const { data } = await api.patch(`/cart/items/${itemId}`, { qty });
  return data.data.cart;
};

export const removeCartItem = async (itemId) => {
  const { data } = await api.delete(`/cart/items/${itemId}`);
  return data.data.cart;
};

export const clearCart = async () => {
  const { data } = await api.delete('/cart');
  return data.data.cart;
};

export const mergeCart = async (items) => {
  const { data } = await api.post('/cart/merge', {
    items: items.map((item) => ({ product: item.productId, size: item.size, qty: item.qty })),
  });
  return data.data.cart;
};
