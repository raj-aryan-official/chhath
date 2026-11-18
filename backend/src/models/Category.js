import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true, maxlength: 80 },
    nameHi: { type: String, trim: true, maxlength: 80, default: '' },
    slug: { type: String, required: true, unique: true, index: true },
    tagline: { type: String, trim: true, maxlength: 140, default: '' },
    taglineHi: { type: String, trim: true, maxlength: 140, default: '' },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    descriptionHi: { type: String, trim: true, maxlength: 1000, default: '' },
    image: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Category = mongoose.model('Category', categorySchema);
