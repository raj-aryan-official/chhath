import { Router } from 'express';
import * as cart from '../controllers/cart.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { writeLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import {
  addCartItemSchema,
  cartItemParamsSchema,
  mergeCartSchema,
  updateCartItemSchema,
} from '../validators/cart.validators.js';

const router = Router();

router.use(requireAuth);

router.get('/', cart.getCart);
router.post('/', writeLimiter, validate(addCartItemSchema), cart.addToCart);
router.post('/merge', validate(mergeCartSchema), cart.mergeCart);
router.patch('/items/:itemId', validate(updateCartItemSchema), cart.updateCartItem);
router.delete('/items/:itemId', validate(cartItemParamsSchema), cart.removeCartItem);
router.delete('/', cart.clearCart);

export default router;
