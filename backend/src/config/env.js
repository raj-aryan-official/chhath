import 'dotenv/config';

const bool = (value, fallback = false) => {
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
};

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT) || 5001,
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),
  mongoUri: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'kharna-dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  admin: {
    name: process.env.ADMIN_NAME || 'Kharna Admin',
    email: process.env.ADMIN_EMAIL || 'admin@kharna.in',
    password: process.env.ADMIN_PASSWORD || 'Admin@12345',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  },
  shipping: {
    fee: Number(process.env.SHIPPING_FEE) || 79,
    freeThreshold: Number(process.env.FREE_SHIPPING_THRESHOLD) || 1999,
  },
  disableRateLimit: bool(process.env.DISABLE_RATE_LIMIT),
};

export const isCloudinaryConfigured = () =>
  Boolean(env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret);

export const isRazorpayConfigured = () => Boolean(env.razorpay.keyId && env.razorpay.keySecret);
