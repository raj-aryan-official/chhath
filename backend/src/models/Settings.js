import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'site', unique: true },
    chhathDate: { type: Date, default: () => new Date('2027-11-05T06:00:00+05:30') },
    heroHeadline: { type: String, default: 'Dress your devotion in gold and saffron' },
    heroHeadlineHi: { type: String, default: '' },
    heroSubline: {
      type: String,
      default:
        'Handpicked sarees for every day of Chhath, from Nahay Khay to Usha Arghya — woven for the women who keep the light.',
    },
    heroSublineHi: { type: String, default: '' },
    announcement: {
      type: String,
      default: 'Free delivery on orders above ₹1,999 · Easy 7-day returns',
    },
    announcementHi: { type: String, default: '' },
    freeShippingThreshold: { type: Number, default: 1999 },
    shippingFee: { type: Number, default: 79 },
    contact: {
      phone: { type: String, default: '' },
      email: { type: String, default: 'hello@kharna.in' },
      address: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

export const Settings = mongoose.model('Settings', settingsSchema);
