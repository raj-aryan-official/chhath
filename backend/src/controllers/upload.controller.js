import { saveImage } from '../middleware/upload.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files?.length) throw ApiError.badRequest('Please choose at least one image');
  const urls = await Promise.all(req.files.map((file) => saveImage(file)));
  res.status(201).json({ success: true, message: 'Images uploaded', data: { urls } });
});
