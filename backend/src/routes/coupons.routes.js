import { Router } from 'express';
import * as coupon from '../controllers/coupon.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { validateCouponSchema } from '../validators/coupon.validators.js';

const router = Router();

router.post('/validate', requireAuth, validate(validateCouponSchema), coupon.validateCoupon);

export default router;
