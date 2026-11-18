import { z } from 'zod';
import { objectId } from './common.js';

export const validateCouponSchema = z.object({
  body: z.object({ code: z.string().trim().min(2, 'Enter a coupon code').max(30) }),
});

export const couponBody = z.object({
  code: z.string().trim().min(3).max(30),
  description: z.string().trim().max(160).optional(),
  descriptionHi: z.string().trim().max(160).optional(),
  type: z.enum(['percent', 'fixed']),
  value: z.coerce.number().min(1),
  minOrder: z.coerce.number().min(0).optional(),
  maxDiscount: z.coerce.number().min(0).optional(),
  expiresAt: z.coerce.date().optional(),
  usageLimit: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const createCouponSchema = z.object({ body: couponBody });

export const updateCouponSchema = z.object({
  params: z.object({ id: objectId }),
  body: couponBody.partial(),
});

export const couponIdSchema = z.object({ params: z.object({ id: objectId }) });
