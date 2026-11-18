import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,
  timeout: 20000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      error.message = 'The request timed out. Please check your connection and try again.';
      return Promise.reject(error);
    }
    const message =
      error.response?.data?.message ||
      (error.response ? 'Something went wrong. Please try again.' : 'Cannot reach the store right now.');
    error.message = message;
    error.details = error.response?.data?.details;
    return Promise.reject(error);
  }
);

/**
 * Turns a params object into a query string friendly object,
 * dropping empty values so URL filters stay clean.
 */
export const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== undefined && value !== null)
  );
