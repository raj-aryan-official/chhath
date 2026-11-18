import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home', trim: true, maxlength: 40 },
  fullName: { type: String, required: true, trim: true, maxlength: 80 },
  line1: { type: String, required: true, trim: true, maxlength: 160 },
  line2: { type: String, trim: true, maxlength: 160, default: '' },
  city: { type: String, required: true, trim: true, maxlength: 80 },
  state: { type: String, required: true, trim: true, maxlength: 80 },
  pincode: { type: String, required: true, trim: true, match: /^\d{6}$/ },
  phone: { type: String, required: true, trim: true, match: /^[6-9]\d{9}$/ },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^\S+@\S+\.\S+$/,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    phone: { type: String, trim: true, default: '' },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    addresses: [addressSchema],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    addresses: this.addresses,
    wishlist: this.wishlist,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model('User', userSchema);
