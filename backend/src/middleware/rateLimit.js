import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const skip = () => env.disableRateLimit || env.nodeEnv === 'test';

const json = (message) => ({ success: false, message });

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  skip,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: json('Too many requests. Please slow down and try again shortly.'),
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 25,
  skip,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: json('Too many attempts. Please try again in 15 minutes.'),
});

export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  skip,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: json('Too many requests. Please slow down and try again shortly.'),
});
