import crypto from 'node:crypto';
import { env, isRazorpayConfigured } from '../config/env.js';
import { getRazorpay } from '../config/razorpay.js';
import { Order } from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const safeCompare = (left, right) => {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const markPaid = async (order, paymentId) => {
  if (order.paymentStatus === 'paid') return order;
  order.paymentStatus = 'paid';
  order.razorpayPaymentId = paymentId;
  if (order.status === 'placed') {
    order.status = 'confirmed';
    order.statusHistory.push({ status: 'confirmed', note: 'Payment received' });
  }
  await order.save();
  return order;
};

export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.validated.body;

  const order = await Order.findOne({ _id: orderId, user: req.user._id });
  if (!order) throw ApiError.notFound('Order not found');
  if (order.paymentMethod !== 'razorpay') {
    throw ApiError.badRequest('This order is set to cash on delivery');
  }
  if (order.paymentStatus === 'paid') throw ApiError.conflict('This order is already paid');
  if (order.status === 'cancelled') throw ApiError.badRequest('This order was cancelled');

  if (!isRazorpayConfigured()) {
    throw new ApiError(
      503,
      'Online payments are not configured yet. Please choose Cash on Delivery.'
    );
  }

  const razorpay = getRazorpay();

  if (!order.razorpayOrderId) {
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(order.total * 100),
      currency: 'INR',
      receipt: order.orderNumber,
      notes: { kharnaOrderId: String(order._id) },
    });
    order.razorpayOrderId = rzpOrder.id;
    await order.save();
  }

  res.json({
    success: true,
    data: {
      keyId: env.razorpay.keyId,
      razorpayOrderId: order.razorpayOrderId,
      amount: Math.round(order.total * 100),
      currency: 'INR',
      orderNumber: order.orderNumber,
      prefill: {
        name: req.user.name,
        email: req.user.email,
        contact: req.user.phone || order.shippingAddress.phone,
      },
    },
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.validated.body;

  const order = await Order.findOne({
    _id: orderId,
    user: req.user._id,
    razorpayOrderId: razorpay_order_id,
  });
  if (!order) throw ApiError.notFound('Order not found for this payment');

  const expected = crypto
    .createHmac('sha256', env.razorpay.keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (!safeCompare(expected, razorpay_signature)) {
    order.paymentStatus = 'failed';
    await order.save();
    throw ApiError.badRequest('Payment verification failed. If money was deducted, contact support.');
  }

  await markPaid(order, razorpay_payment_id);
  res.json({ success: true, message: 'Payment confirmed', data: { order } });
});

export const razorpayWebhook = asyncHandler(async (req, res) => {
  if (!env.razorpay.webhookSecret) {
    return res.status(503).json({ success: false, message: 'Webhook secret is not configured' });
  }

  const signature = req.headers['x-razorpay-signature'];
  const digest = crypto
    .createHmac('sha256', env.razorpay.webhookSecret)
    .update(req.body)
    .digest('hex');

  if (!signature || !safeCompare(digest, signature)) {
    return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
  }

  const event = JSON.parse(req.body.toString());
  const payment = event?.payload?.payment?.entity;

  if (payment?.order_id) {
    const order = await Order.findOne({ razorpayOrderId: payment.order_id });
    if (order) {
      if (event.event === 'payment.captured') await markPaid(order, payment.id);
      if (event.event === 'payment.failed' && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'failed';
        await order.save();
      }
    }
  }

  return res.json({ success: true, received: true });
});
