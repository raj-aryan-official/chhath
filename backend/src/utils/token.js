import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const AUTH_COOKIE = 'kharna_token';

export const signToken = (userId) =>
  jwt.sign({ sub: String(userId) }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

export const cookieOptions = () => ({
  httpOnly: true,
  secure: env.isProduction,
  sameSite: 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

export const setAuthCookie = (res, token) => {
  res.cookie(AUTH_COOKIE, token, cookieOptions());
};

export const clearAuthCookie = (res) => {
  const { maxAge: _maxAge, ...options } = cookieOptions();
  res.clearCookie(AUTH_COOKIE, options);
};
