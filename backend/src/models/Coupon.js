import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, trim: true, maxlength: 160, default: '' },
    descriptionHi: { type: String, trim: true, maxlength: 160, default: '' },
    type: { type: String, enum: ['percent', 'fixed'], required: true },
    value: { type: Number, required: true, min: 1 },
    minOrder: { type: Number, default: 0, min: 0 },
    maxDiscount: { type: Number, default: 0, min: 0 },
    expiresAt: { type: Date },
    usageLimit: { type: Number, default: 0, min: 0 },
    usedCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.methods.isUsable = function isUsable(subtotal) {
  if (!this.isActive) return { ok: false, message: 'This coupon is not active' };
  if (this.expiresAt && this.expiresAt.getTime() < Date.now()) {
    return { ok: false, message: 'This coupon has expired' };
  }
  if (this.usageLimit > 0 && this.usedCount >= this.usageLimit) {
    return { ok: false, message: 'This coupon has reached its usage limit' };
  }
  if (subtotal < this.minOrder) {
    return { ok: false, message: `Minimum order value for this coupon is ₹${this.minOrder}` };
  }
  return { ok: true };
};

couponSchema.methods.computeDiscount = function computeDiscount(subtotal) {
  const raw = this.type === 'percent' ? (subtotal * this.value) / 100 : this.value;
  const capped = this.maxDiscount > 0 ? Math.min(raw, this.maxDiscount) : raw;
  return Math.min(Math.round(capped), subtotal);
};

export const Coupon = mongoose.model('Coupon', couponSchema);
