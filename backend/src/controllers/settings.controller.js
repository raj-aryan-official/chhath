import { isRazorpayConfigured } from '../config/env.js';
import { Settings } from '../models/Settings.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getPublicSettings = asyncHandler(async (_req, res) => {
  let settings = await Settings.findOne({ key: 'site' });
  if (!settings) settings = await Settings.create({ key: 'site' });

  res.json({
    success: true,
    data: {
      settings,
      payments: {
        razorpayEnabled: isRazorpayConfigured(),
        codEnabled: true,
      },
    },
  });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.findOneAndUpdate(
    { key: 'site' },
    { $set: req.validated.body, $setOnInsert: { key: 'site' } },
    { new: true, upsert: true, runValidators: true }
  );

  res.json({ success: true, message: 'Store settings saved', data: { settings } });
});
