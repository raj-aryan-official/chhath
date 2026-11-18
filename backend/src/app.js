import path from 'node:path';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { razorpayWebhook } from './controllers/payment.controller.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { globalLimiter } from './middleware/rateLimit.js';
import adminRoutes from './routes/admin.routes.js';
import authRoutes from './routes/auth.routes.js';
import cartRoutes from './routes/cart.routes.js';
import categoriesRoutes from './routes/categories.routes.js';
import couponsRoutes from './routes/coupons.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import paymentsRoutes from './routes/payments.routes.js';
import productsRoutes from './routes/products.routes.js';
import reviewsRoutes from './routes/reviews.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import usersRoutes from './routes/users.routes.js';

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(cors({ origin: env.clientUrls, credentials: true }));
app.use(compression());
app.use(morgan(env.isProduction ? 'combined' : 'dev'));

// Razorpay signs the raw request bytes, so this route must run before express.json().
app.post('/api/v1/payments/webhook', express.raw({ type: '*/*' }), razorpayWebhook);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(mongoSanitize());

app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads'), { maxAge: '7d' }));

app.get('/api/v1/health', (_req, res) => {
  res.json({ success: true, message: 'Kharna API is running', data: { uptime: process.uptime() } });
});

app.use('/api/v1', globalLimiter);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/products', productsRoutes);
app.use('/api/v1/categories', categoriesRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', ordersRoutes);
app.use('/api/v1/payments', paymentsRoutes);
app.use('/api/v1/reviews', reviewsRoutes);
app.use('/api/v1/coupons', couponsRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
