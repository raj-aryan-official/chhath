import { Router } from 'express';
import * as auth from '../controllers/auth.controller.js';
import { optionalAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '../validators/auth.validators.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), auth.register);
router.post('/login', authLimiter, validate(loginSchema), auth.login);
router.post('/logout', auth.logout);
router.get('/me', optionalAuth, auth.me);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), auth.forgotPassword);
router.post('/reset-password/:token', authLimiter, validate(resetPasswordSchema), auth.resetPassword);

export default router;
