import { Router } from 'express';
import * as user from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { writeLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import {
  changePasswordSchema,
  createAddressSchema,
  updateAddressSchema,
  updateProfileSchema,
} from '../validators/auth.validators.js';
import { wishlistParamsSchema } from '../validators/user.validators.js';

const router = Router();

router.use(requireAuth);

router.patch('/profile', writeLimiter, validate(updateProfileSchema), user.updateProfile);
router.patch('/password', writeLimiter, validate(changePasswordSchema), user.changePassword);

router.get('/addresses', user.listAddresses);
router.post('/addresses', validate(createAddressSchema), user.addAddress);
router.patch('/addresses/:id', validate(updateAddressSchema), user.updateAddress);
router.delete('/addresses/:id', user.deleteAddress);

router.get('/wishlist', user.listWishlist);
router.post('/wishlist/:productId', writeLimiter, validate(wishlistParamsSchema), user.addToWishlist);
router.delete('/wishlist/:productId', validate(wishlistParamsSchema), user.removeFromWishlist);

export default router;
