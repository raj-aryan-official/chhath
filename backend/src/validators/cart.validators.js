import { z } from 'zod';
import { objectId } from './common.js';

const cartItem = z.object({
  product: objectId,
  size: z.string().trim().min(1).max(60),
  qty: z.coerce.number().int().min(1).max(10),
});

export const addCartItemSchema = z.object({ body: cartItem });

export const updateCartItemSchema = z.object({
  params: z.object({ itemId: z.string().min(1) }),
  body: z.object({ qty: z.coerce.number().int().min(1).max(10) }),
});

export const cartItemParamsSchema = z.object({ params: z.object({ itemId: z.string().min(1) }) });

export const mergeCartSchema = z.object({
  body: z.object({ items: z.array(cartItem).max(20) }),
});
