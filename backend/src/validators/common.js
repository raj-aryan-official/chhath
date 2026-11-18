import { z } from 'zod';

export const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid identifier');

export const pincode = z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode');
export const phone = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number');

export const addressShape = {
  label: z.string().trim().max(40).optional(),
  fullName: z.string().trim().min(2, 'Name is required').max(80),
  line1: z.string().trim().min(4, 'Address is required').max(160),
  line2: z.string().trim().max(160).optional().default(''),
  city: z.string().trim().min(2, 'City is required').max(80),
  state: z.string().trim().min(2, 'State is required').max(80),
  pincode,
  phone,
  isDefault: z.boolean().optional(),
};

export const addressSchema = z.object(addressShape);

export const paginationQuery = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
};
