import { z } from 'zod';

export const createReviewSchema = z.object({
  params: z.object({ productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product') }),
  body: z.object({
    rating: z.coerce.number().int().min(1, 'Choose a rating').max(5),
    title: z.string().trim().max(100).optional(),
    comment: z.string().trim().min(10, 'Please write at least 10 characters').max(1000),
  }),
});

export const listReviewsSchema = z.object({
  params: z.object({ productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product') }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(20).default(6),
  }),
});

export const reviewIdSchema = z.object({
  params: z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid review') }),
});
