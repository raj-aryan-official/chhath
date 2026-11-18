import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { Review } from '../models/Review.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const recalcProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const { average = 0, count = 0 } = stats[0] || {};
  await Product.findByIdAndUpdate(productId, {
    ratingsAverage: Math.round(average * 10) / 10,
    ratingsCount: count,
  });
};

export const listReviews = asyncHandler(async (req, res) => {
  const { productId } = req.validated.params;
  const { page, limit } = req.validated.query;

  const [reviews, total] = await Promise.all([
    Review.find({ product: productId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Review.countDocuments({ product: productId }),
  ]);

  res.json({ success: true, data: { reviews, page, pages: Math.ceil(total / limit), total } });
});

export const createReview = asyncHandler(async (req, res) => {
  const { productId } = req.validated.params;
  const { rating, title, comment } = req.validated.body;

  const product = await Product.exists({ _id: productId, isActive: true });
  if (!product) throw ApiError.notFound('Saree not found');

  const alreadyReviewed = await Review.exists({ product: productId, user: req.user._id });
  if (alreadyReviewed) throw ApiError.conflict('You have already reviewed this saree');

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    name: req.user.name,
    rating,
    title,
    comment,
  });

  await recalcProductRating(productId);

  res.status(201).json({ success: true, message: 'Thank you for your review', data: { review } });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const review = await Review.findById(id);
  if (!review) throw ApiError.notFound('Review not found');

  const isOwner = String(review.user) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') throw ApiError.forbidden();

  await review.deleteOne();
  await recalcProductRating(review.product);

  res.json({ success: true, message: 'Review removed' });
});
