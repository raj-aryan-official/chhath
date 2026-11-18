import { api } from './api.js';

export const updateProfile = async (payload) => {
  const { data } = await api.patch('/users/profile', payload);
  return data.data.user;
};

export const changePassword = async (payload) => {
  const { data } = await api.patch('/users/password', payload);
  return data;
};

export const addAddress = async (payload) => {
  const { data } = await api.post('/users/addresses', payload);
  return data.data.addresses;
};

export const updateAddress = async (id, payload) => {
  const { data } = await api.patch(`/users/addresses/${id}`, payload);
  return data.data.addresses;
};

export const deleteAddress = async (id) => {
  const { data } = await api.delete(`/users/addresses/${id}`);
  return data.data.addresses;
};

export const fetchWishlist = async () => {
  const { data } = await api.get('/users/wishlist');
  return data.data.products;
};

export const addToWishlist = async (productId) => {
  const { data } = await api.post(`/users/wishlist/${productId}`);
  return data.data.wishlist;
};

export const removeFromWishlist = async (productId) => {
  const { data } = await api.delete(`/users/wishlist/${productId}`);
  return data.data.wishlist;
};
