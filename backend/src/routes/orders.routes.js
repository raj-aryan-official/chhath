import { Router } from 'express';
import * as order from '../controllers/order.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { writeLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import {
  createOrderSchema,
  listMyOrdersSchema,
  orderIdSchema,
} from '../validators/order.validators.js';

const router = Router();

router.use(requireAuth);

router.post('/', writeLimiter, validate(createOrderSchema), order.createOrder);
router.get('/', validate(listMyOrdersSchema), order.listMyOrders);
router.get('/:id', validate(orderIdSchema), order.getOrder);
router.post('/:id/cancel', validate(orderIdSchema), order.cancelOrder);

export default router;
