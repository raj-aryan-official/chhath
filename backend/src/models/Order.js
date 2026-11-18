import mongoose from 'mongoose';
import { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from '../utils/catalog.js';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    nameHi: { type: String, default: '' },
    slug: { type: String, required: true },
    image: { type: String, required: true },
    fabric: { type: String, default: '' },
    color: { type: String, default: '' },
    size: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: {
      fullName: { type: String, required: true },
      line1: { type: String, required: true },
      line2: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      phone: { type: String, required: true },
    },
    itemsTotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    couponCode: { type: String, default: '' },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: 'pending' },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    status: { type: String, enum: ORDER_STATUSES, default: 'placed', index: true },
    statusHistory: {
      type: [
        {
          status: { type: String, enum: ORDER_STATUSES, required: true },
          note: { type: String, default: '' },
          at: { type: Date, default: Date.now },
        },
      ],
      default: () => [{ status: 'placed', note: 'Order placed', at: new Date() }],
    },
    deliveryEstimate: { type: Date },
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });

export const Order = mongoose.model('Order', orderSchema);
