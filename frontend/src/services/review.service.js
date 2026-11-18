import { api } from './api.js';

export const fetchReviews = async (productId, params) => {
  const { data } = await api.get(`/reviews/product/${productId}`, { params });
  return data.data;
};

export const createReview = async (productId, payload) => {
  const { data } = await api.post(`/reviews/product/${productId}`, payload);
  return data.data.review;
};

export const deleteReview = async (id) => {
  await api.delete(`/reviews/${id}`);
};
