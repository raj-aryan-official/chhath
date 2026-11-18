import { api, cleanParams } from './api.js';

export const fetchProducts = async (params) => {
  const { data } = await api.get('/products', { params: cleanParams(params) });
  return data.data;
};

export const fetchProductBySlug = async (slug) => {
  const { data } = await api.get(`/products/${slug}`);
  return data.data.product;
};

export const fetchRelatedProducts = async (slug) => {
  const { data } = await api.get(`/products/${slug}/related`);
  return data.data.products;
};

export const fetchCategories = async () => {
  const { data } = await api.get('/categories');
  return data.data.categories;
};

export const fetchSettings = async () => {
  const { data } = await api.get('/settings');
  return data.data;
};
