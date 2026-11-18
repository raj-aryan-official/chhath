import { Cart } from '../models/Cart.js';
import { Coupon } from '../models/Coupon.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { roundRupees } from '../utils/helpers.js';

const cartSubtotal = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  let subtotal = 0;

  for (const item of cart?.items ?? []) {
    const product = item.product;
    if (!product?.isActive) continue;
    const size = product.sizes.find((option) => option.label === item.size);
    if (!size) continue;
    subtotal += (product.price + (size.priceDelta || 0)) * Math.min(item.qty, product.stock);
  }

  return roundRupees(subtotal);
};

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code } = req.validated.body;

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) throw ApiError.badRequest('That coupon code is not valid');

  const subtotal = await cartSubtotal(req.user._id);
  if (subtotal === 0) throw ApiError.badRequest('Add something to your cart first');

  const usability = coupon.isUsable(subtotal);
  if (!usability.ok) throw ApiError.badRequest(usability.message);

  res.json({
    success: true,
    message: `Coupon ${coupon.code} applied`,
    data: {
      code: coupon.code,
      description: coupon.description,
      discount: coupon.computeDiscount(subtotal),
      itemsTotal: subtotal,
    },
  });
});

export const listCoupons = asyncHandler(async (_req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, data: { coupons } });
});

export const createCoupon = asyncHandler(async (req, res) => {
  const payload = req.validated.body;
  const exists = await Coupon.exists({ code: payload.code.toUpperCase() });
  if (exists) throw ApiError.conflict('A coupon with this code already exists');

  const coupon = await Coupon.create(payload);
  res.status(201).json({ success: true, message: 'Coupon created', data: { coupon } });
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const coupon = await Coupon.findById(id);
  if (!coupon) throw ApiError.notFound('Coupon not found');

  Object.entries(req.validated.body).forEach(([key, value]) => {
    if (value !== undefined) coupon[key] = value;
  });
  await coupon.save();

  res.json({ success: true, message: 'Coupon updated', data: { coupon } });
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) throw ApiError.notFound('Coupon not found');
  res.json({ success: true, message: 'Coupon deleted' });
});
