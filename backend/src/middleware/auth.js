import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AUTH_COOKIE } from '../utils/token.js';

const readToken = (req) => {
  const cookieToken = req.cookies?.[AUTH_COOKIE];
  if (cookieToken) return cookieToken;

  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return null;
};

const resolveUser = async (req, required) => {
  const token = readToken(req);
  if (!token) {
    if (required) throw ApiError.unauthorized();
    return null;
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    if (required) throw ApiError.unauthorized('Your session has expired. Please sign in again.');
    return null;
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    if (required) throw ApiError.unauthorized('Account no longer exists');
    return null;
  }
  return user;
};

export const requireAuth = asyncHandler(async (req, _res, next) => {
  req.user = await resolveUser(req, true);
  next();
});

export const optionalAuth = asyncHandler(async (req, _res, next) => {
  req.user = await resolveUser(req, false);
  next();
});

export const requireAdmin = (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (req.user.role !== 'admin') return next(ApiError.forbidden('Admin access only'));
  return next();
};
