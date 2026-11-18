import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { clearAuthCookie, setAuthCookie, signToken } from '../utils/token.js';

const issueSession = (res, user) => {
  setAuthCookie(res, signToken(user._id));
  return user.toSafeJSON();
};

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.validated.body;

  const existing = await User.exists({ email });
  if (existing) throw ApiError.conflict('An account with this email already exists. Try signing in.');

  const user = await User.create({ name, email, password, phone });
  res.status(201).json({
    success: true,
    message: 'Welcome to Kharna',
    data: { user: issueSession(res, user) },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Email or password is incorrect');
  }

  res.json({
    success: true,
    message: `Welcome back, ${user.name.split(' ')[0]}`,
    data: { user: issueSession(res, user) },
  });
});

export const logout = asyncHandler(async (_req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, message: 'Signed out' });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user ? req.user.toSafeJSON() : null } });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.validated.body;
  const user = await User.findOne({ email });

  // Always answer the same way so the endpoint cannot be used to enumerate accounts.
  if (!user) {
    return res.json({
      success: true,
      message: 'If that email is registered, a reset link has been sent.',
    });
  }

  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = hashToken(token);
  user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();

  const resetUrl = `${env.clientUrls[0]}/reset-password/${token}`;

  if (env.isProduction) {
    // TODO: send this link through your transactional email provider.
    console.log(`[auth] Password reset requested for ${email}`);
  }

  res.json({
    success: true,
    message: 'If that email is registered, a reset link has been sent.',
    ...(env.isProduction
      ? {}
      : {
          data: {
            devResetToken: token,
            devResetUrl: resetUrl,
            note: 'Email delivery is not configured in development, so the reset link is returned here.',
          },
        }),
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.validated.params;
  const { password } = req.validated.body;

  const user = await User.findOne({
    resetPasswordToken: hashToken(token),
    resetPasswordExpires: { $gt: new Date() },
  }).select('+password +resetPasswordToken +resetPasswordExpires');

  if (!user) throw ApiError.badRequest('This reset link is invalid or has expired');

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Password updated. You are signed in.',
    data: { user: issueSession(res, user) },
  });
});
