import mongoose from 'mongoose';
import { CHHATH_DAYS, COLOR_FAMILIES, FABRICS, SIZE_PRESETS } from '../utils/catalog.js';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 140 },
    nameHi: { type: String, trim: true, maxlength: 140, default: '' },
    slug: { type: String, required: true, unique: true, index: true },
    shortDescription: { type: String, trim: true, maxlength: 220, default: '' },
    shortDescriptionHi: { type: String, trim: true, maxlength: 220, default: '' },
    description: { type: String, required: true, trim: true, maxlength: 4000 },
    descriptionHi: { type: String, trim: true, maxlength: 4000, default: '' },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    fabric: { type: String, enum: FABRICS, required: true, index: true },
    day: { type: String, enum: CHHATH_DAYS, default: 'All Days', index: true },
    color: {
      name: { type: String, enum: COLOR_FAMILIES, required: true, index: true },
      hex: { type: String, required: true, match: /^#[0-9a-fA-F]{6}$/ },
    },
    sizes: {
      type: [{ label: { type: String, required: true }, priceDelta: { type: Number, default: 0, min: 0 } }],
      default: () => SIZE_PRESETS.map((size) => ({ ...size })),
    },
    images: { type: [String], required: true, validate: (v) => v.length > 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    blouse: {
      included: { type: Boolean, default: true },
      details: { type: String, trim: true, maxlength: 200, default: 'Unstitched blouse piece included' },
    },
    care: { type: String, trim: true, maxlength: 300, default: 'Dry clean only. Store wrapped in muslin.' },
    careHi: { type: String, trim: true, maxlength: 300, default: '' },
    tags: { type: [String], default: [] },
    ratingsAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingsCount: { type: Number, default: 0, min: 0 },
    soldCount: { type: Number, default: 0, min: 0 },
    isFeatured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productSchema.virtual('discountPercent').get(function discountPercent() {
  if (!this.mrp || this.mrp <= this.price) return 0;
  return Math.round(((this.mrp - this.price) / this.mrp) * 100);
});

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ price: 1 });

export const Product = mongoose.model('Product', productSchema);
