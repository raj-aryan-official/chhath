import { api } from './api.js';

export const login = async (payload) => {
  const { data } = await api.post('/auth/login', payload);
  return data.data.user;
};

export const register = async (payload) => {
  const { data } = await api.post('/auth/register', payload);
  return data.data.user;
};

export const logout = async () => {
  await api.post('/auth/logout');
};

export const me = async () => {
  const { data } = await api.get('/auth/me');
  return data.data.user;
};

export const forgotPassword = async (email) => {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
};

export const resetPassword = async (token, password) => {
  const { data } = await api.post(`/auth/reset-password/${token}`, { password });
  return data.data.user;
};
