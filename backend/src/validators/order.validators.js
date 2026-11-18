import { z } from 'zod';
import { ORDER_STATUSES, PAYMENT_METHODS } from '../utils/catalog.js';
import { addressSchema, objectId, paginationQuery } from './common.js';

const orderItem = z.object({
  product: objectId,
  size: z.string().trim().min(1).max(60),
  qty: z.coerce.number().int().min(1).max(10),
});

export const createOrderSchema = z.object({
  body: z
    .object({
      items: z.array(orderItem).min(1, 'Your cart is empty').max(20),
      addressId: z.string().min(1).optional(),
      address: addressSchema.optional(),
      paymentMethod: z.enum(PAYMENT_METHODS),
      couponCode: z.string().trim().max(30).optional(),
    })
    .refine((data) => Boolean(data.addressId || data.address), {
      message: 'A delivery address is required',
      path: ['address'],
    }),
});

export const orderIdSchema = z.object({ params: z.object({ id: objectId }) });

export const listMyOrdersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(20).default(12),
  }),
});

export const adminListOrdersSchema = z.object({
  query: z.object({
    ...paginationQuery,
    status: z.enum(ORDER_STATUSES).optional(),
    q: z.string().trim().max(80).optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    status: z.enum(ORDER_STATUSES),
    note: z.string().trim().max(200).optional(),
  }),
});

export const paymentOrderSchema = z.object({
  body: z.object({ orderId: objectId }),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    orderId: objectId,
    razorpay_order_id: z.string().min(1),
    razorpay_payment_id: z.string().min(1),
    razorpay_signature: z.string().min(1),
  }),
});
