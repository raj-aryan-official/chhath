import { isRazorpayConfigured } from '../config/env.js';
import { Cart } from '../models/Cart.js';
import { Coupon } from '../models/Coupon.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { orderNumber, roundRupees } from '../utils/helpers.js';
import { computeShippingFee, getShippingConfig, priceCartItems } from '../utils/pricing.js';

const STATUS_FLOW = ['placed', 'confirmed', 'packed', 'shipped', 'delivered'];

const restoreStock = (items) =>
  Promise.all(
    items.map((item) =>
      Product.updateOne({ _id: item.product }, [
        {
          $set: {
            stock: { $add: ['$stock', item.qty] },
            soldCount: { $max: [0, { $subtract: ['$soldCount', item.qty] }] },
          },
        },
      ])
    )
  );

const resolveAddress = (user, addressId, address) => {
  if (addressId) {
    const saved = user.addresses.id(addressId);
    if (!saved) throw ApiError.badRequest('The selected address was not found');
    return {
      fullName: saved.fullName,
      line1: saved.line1,
      line2: saved.line2,
      city: saved.city,
      state: saved.state,
      pincode: saved.pincode,
      phone: saved.phone,
    };
  }
  return {
    fullName: address.fullName,
    line1: address.line1,
    line2: address.line2 || '',
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    phone: address.phone,
  };
};

export const createOrder = asyncHandler(async (req, res) => {
  const { items: rawItems, addressId, address, paymentMethod, couponCode } = req.validated.body;

  if (paymentMethod === 'razorpay' && !isRazorpayConfigured()) {
    throw new ApiError(
      503,
      'Online payments are not configured yet. Please choose Cash on Delivery.'
    );
  }

  const { items, itemsTotal } = await priceCartItems(rawItems);

  let discount = 0;
  let coupon = null;
  if (couponCode) {
    coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (!coupon) throw ApiError.badRequest('That coupon code is not valid');

    const usability = coupon.isUsable(itemsTotal);
    if (!usability.ok) throw ApiError.badRequest(usability.message);
    discount = coupon.computeDiscount(itemsTotal);
  }

  const shippingConfig = await getShippingConfig();
  const shippingFee = computeShippingFee(itemsTotal - discount, shippingConfig);
  const total = roundRupees(itemsTotal - discount + shippingFee);
  const shippingAddress = resolveAddress(req.user, addressId, address);

  const decremented = [];
  try {
    for (const item of items) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.product, isActive: true, stock: { $gte: item.qty } },
        { $inc: { stock: -item.qty, soldCount: item.qty } },
        { new: true }
      );
      if (!updated) {
        throw ApiError.conflict(`${item.name} just went out of stock. Please review your cart.`);
      }
      decremented.push(item);
    }
  } catch (error) {
    await restoreStock(decremented);
    throw error;
  }

  let order;
  try {
    order = await Order.create({
      orderNumber: orderNumber(),
      user: req.user._id,
      items: items.map(({ product, name, nameHi, slug, image, fabric, color, size, price, qty }) => ({
        product,
        name,
        nameHi,
        slug,
        image,
        fabric,
        color,
        size,
        price,
        qty,
      })),
      shippingAddress,
      itemsTotal,
      discount,
      shippingFee,
      total,
      couponCode: coupon?.code || '',
      paymentMethod,
      paymentStatus: 'pending',
      deliveryEstimate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    });
  } catch (error) {
    await restoreStock(items);
    throw error;
  }

  if (coupon) {
    await Coupon.updateOne({ _id: coupon._id }, { $inc: { usedCount: 1 } });
  }
  await Cart.updateOne({ user: req.user._id }, { $set: { items: [] } });

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: { order },
  });
});

export const listMyOrders = asyncHandler(async (req, res) => {
  const { page, limit } = req.validated.query;
  const filter = { user: req.user._id };

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Order.countDocuments(filter),
  ]);

  res.json({ success: true, data: { orders, page, pages: Math.ceil(total / limit), total } });
});

export const getOrder = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const order = await Order.findById(id).populate('user', 'name email phone');

  if (!order) throw ApiError.notFound('Order not found');

  const isOwner = String(order.user?._id || order.user) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') throw ApiError.forbidden();

  res.json({ success: true, data: { order } });
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const order = await Order.findOne({ _id: id, user: req.user._id });
  if (!order) throw ApiError.notFound('Order not found');

  if (!['placed', 'confirmed'].includes(order.status)) {
    throw ApiError.badRequest('Orders can only be cancelled before they are packed');
  }
  if (order.paymentStatus === 'paid') {
    throw ApiError.badRequest('Paid orders need a manual refund — please contact support to cancel');
  }

  order.status = 'cancelled';
  order.statusHistory.push({ status: 'cancelled', note: 'Cancelled by customer' });
  await order.save();
  await restoreStock(order.items);

  res.json({ success: true, message: 'Order cancelled', data: { order } });
});

export const adminListOrders = asyncHandler(async (req, res) => {
  const { page, limit, status, q } = req.validated.query;
  const filter = {};
  if (status) filter.status = status;
  if (q) filter.orderNumber = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name email'),
    Order.countDocuments(filter),
  ]);

  res.json({ success: true, data: { orders, page, pages: Math.ceil(total / limit), total } });
});

export const adminUpdateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const { status, note } = req.validated.body;

  const order = await Order.findById(id);
  if (!order) throw ApiError.notFound('Order not found');

  if (order.status === status) {
    return res.json({ success: true, message: 'Status unchanged', data: { order } });
  }
  if (['delivered', 'cancelled'].includes(order.status)) {
    throw ApiError.badRequest(`A ${order.status} order can no longer be changed`);
  }

  if (status === 'cancelled') {
    if (order.status === 'shipped') {
      throw ApiError.badRequest('Shipped orders cannot be cancelled from the panel');
    }
    if (order.paymentStatus === 'paid') order.paymentStatus = 'refunded';
    await restoreStock(order.items);
  } else if (STATUS_FLOW.indexOf(status) < STATUS_FLOW.indexOf(order.status)) {
    throw ApiError.badRequest('Order status cannot move backwards');
  }

  if (status === 'delivered' && order.paymentMethod === 'cod') {
    order.paymentStatus = 'paid';
  }

  order.status = status;
  order.statusHistory.push({ status, note: note || '' });
  await order.save();

  res.json({ success: true, message: `Order marked ${status}`, data: { order } });
});
