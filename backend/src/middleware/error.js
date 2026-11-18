import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const zodDetails = (error) =>
  error.issues.map((issue) => ({
    field: issue.path.filter((part) => part !== 'body' && part !== 'query' && part !== 'params').join('.'),
    message: issue.message,
  }));

export const errorHandler = (err, req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: 'Please check the highlighted fields',
      details: zodDetails(err),
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid identifier supplied' });
  }

  if (err.name === 'ValidationError') {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      details: Object.values(err.errors).map((e) => ({ field: e.path, message: e.message })),
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: 'That value is already in use' });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request payload is too large' });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5MB or smaller' : err.message,
    });
  }

  console.error('[error]', err);
  return res.status(500).json({
    success: false,
    message: 'Something went wrong on our side. Please try again.',
    ...(env.isProduction ? {} : { debug: err.message }),
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
};
