import { Router } from 'express';
import * as admin from '../controllers/admin.controller.js';
import * as category from '../controllers/category.controller.js';
import * as coupon from '../controllers/coupon.controller.js';
import * as order from '../controllers/order.controller.js';
import * as product from '../controllers/product.controller.js';
import * as settings from '../controllers/settings.controller.js';
import { uploadImages } from '../controllers/upload.controller.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { writeLimiter } from '../middleware/rateLimit.js';
import { upload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import {
  createCategorySchema,
  deleteCategorySchema,
  updateCategorySchema,
} from '../validators/category.validators.js';
import {
  couponIdSchema,
  createCouponSchema,
  updateCouponSchema,
} from '../validators/coupon.validators.js';
import {
  adminListOrdersSchema,
  updateOrderStatusSchema,
} from '../validators/order.validators.js';
import {
  createProductSchema,
  listProductsSchema,
  productIdSchema,
  updateProductSchema,
} from '../validators/product.validators.js';
import { updateSettingsSchema } from '../validators/settings.validators.js';
import { z } from 'zod';
import { paginationQuery } from '../validators/common.js';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/stats', admin.getDashboardStats);
router.get(
  '/users',
  validate(z.object({ query: z.object({ ...paginationQuery, q: z.string().trim().max(80).optional() }) })),
  admin.listUsers
);

router.get('/products', validate(listProductsSchema), product.adminListProducts);
router.post('/products', writeLimiter, validate(createProductSchema), product.createProduct);
router.patch('/products/:id', validate(updateProductSchema), product.updateProduct);
router.delete('/products/:id', validate(productIdSchema), product.deleteProduct);

router.post('/categories', validate(createCategorySchema), category.createCategory);
router.patch('/categories/:id', validate(updateCategorySchema), category.updateCategory);
router.delete('/categories/:id', validate(deleteCategorySchema), category.deleteCategory);

router.get('/orders', validate(adminListOrdersSchema), order.adminListOrders);
router.patch('/orders/:id/status', validate(updateOrderStatusSchema), order.adminUpdateOrderStatus);

router.get('/coupons', coupon.listCoupons);
router.post('/coupons', validate(createCouponSchema), coupon.createCoupon);
router.patch('/coupons/:id', validate(updateCouponSchema), coupon.updateCoupon);
router.delete('/coupons/:id', validate(couponIdSchema), coupon.deleteCoupon);

router.put('/settings', validate(updateSettingsSchema), settings.updateSettings);

router.post('/uploads', upload.array('images', 6), uploadImages);

export default router;
