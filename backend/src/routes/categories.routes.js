import { Router } from 'express';
import * as category from '../controllers/category.controller.js';
import { validate } from '../middleware/validate.js';
import { categorySlugSchema } from '../validators/category.validators.js';

const router = Router();

router.get('/', category.listCategories);
router.get('/:slug', validate(categorySlugSchema), category.getCategoryBySlug);

export default router;
