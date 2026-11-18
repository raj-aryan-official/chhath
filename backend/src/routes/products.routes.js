import { Router } from 'express';
import * as product from '../controllers/product.controller.js';
import { optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  listProductsSchema,
  productSlugSchema,
  relatedSchema,
} from '../validators/product.validators.js';

const router = Router();

router.get('/', validate(listProductsSchema), product.listProducts);
router.get('/:slug/related', validate(relatedSchema), product.getRelatedProducts);
router.get('/:slug', optionalAuth, validate(productSlugSchema), product.getProductBySlug);

export default router;
