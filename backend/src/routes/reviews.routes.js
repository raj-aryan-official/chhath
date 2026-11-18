import { Router } from 'express';
import * as review from '../controllers/review.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { writeLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { createReviewSchema, listReviewsSchema, reviewIdSchema } from '../validators/review.validators.js';

const router = Router();

router.get('/product/:productId', validate(listReviewsSchema), review.listReviews);
router.post(
  '/product/:productId',
  requireAuth,
  writeLimiter,
  validate(createReviewSchema),
  review.createReview
);
router.delete('/:id', requireAuth, validate(reviewIdSchema), review.deleteReview);

export default router;
