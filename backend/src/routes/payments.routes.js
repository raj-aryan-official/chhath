import { Router } from 'express';
import * as payment from '../controllers/payment.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { writeLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { paymentOrderSchema, verifyPaymentSchema } from '../validators/order.validators.js';

const router = Router();

router.use(requireAuth);

router.post('/order', writeLimiter, validate(paymentOrderSchema), payment.createPaymentOrder);
router.post('/verify', writeLimiter, validate(verifyPaymentSchema), payment.verifyPayment);

export default router;
