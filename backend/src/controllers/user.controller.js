import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.validated.body;
  const user = await User.findById(req.user._id);
  user.name = name;
  user.phone = phone ?? user.phone;
  await user.save();
  res.json({ success: true, message: 'Profile updated', data: { user: user.toSafeJSON() } });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.validated.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.badRequest('Your current password is incorrect');
  }

  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password changed' });
});

export const listAddresses = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { addresses: req.user.addresses } });
});

export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const payload = req.validated.body;

  if (payload.isDefault || user.addresses.length === 0) {
    user.addresses.forEach((address) => {
      address.isDefault = false;
    });
    payload.isDefault = true;
  }

  user.addresses.push(payload);
  await user.save();

  res.status(201).json({ success: true, message: 'Address saved', data: { addresses: user.addresses } });
});

export const updateAddress = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const payload = req.validated.body;

  const user = await User.findById(req.user._id);
  const address = user.addresses.id(id);
  if (!address) throw ApiError.notFound('Address not found');

  if (payload.isDefault) {
    user.addresses.forEach((entry) => {
      entry.isDefault = false;
    });
  }

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined) address[key] = value;
  });

  await user.save();
  res.json({ success: true, message: 'Address updated', data: { addresses: user.addresses } });
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(id);
  if (!address) throw ApiError.notFound('Address not found');

  const wasDefault = address.isDefault;
  address.deleteOne();
  if (wasDefault && user.addresses.length > 0) user.addresses[0].isDefault = true;

  await user.save();
  res.json({ success: true, message: 'Address removed', data: { addresses: user.addresses } });
});

export const listWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'wishlist',
    match: { isActive: true },
    populate: { path: 'category', select: 'name slug' },
  });
  res.json({ success: true, data: { products: user.wishlist.filter(Boolean) } });
});

export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.validated.params;
  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) throw ApiError.notFound('Saree not found');

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { wishlist: product._id } },
    { new: true }
  );

  res.json({ success: true, message: 'Saved to wishlist', data: { wishlist: user.wishlist } });
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.validated.params;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { wishlist: productId } },
    { new: true }
  );
  res.json({ success: true, message: 'Removed from wishlist', data: { wishlist: user.wishlist } });
});
