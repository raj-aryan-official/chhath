import { z } from 'zod';

export const updateSettingsSchema = z.object({
  body: z.object({
    chhathDate: z.coerce.date().optional(),
    heroHeadline: z.string().trim().min(4).max(120).optional(),
    heroHeadlineHi: z.string().trim().max(120).optional(),
    heroSubline: z.string().trim().min(10).max(300).optional(),
    heroSublineHi: z.string().trim().max(300).optional(),
    announcement: z.string().trim().max(160).optional(),
    announcementHi: z.string().trim().max(160).optional(),
    freeShippingThreshold: z.coerce.number().min(0).optional(),
    shippingFee: z.coerce.number().min(0).optional(),
    contact: z
      .object({
        phone: z.string().trim().max(20).optional(),
        email: z.string().trim().email('Enter a valid email').or(z.literal('')).optional(),
        address: z.string().trim().max(300).optional(),
      })
      .optional(),
  }),
});
