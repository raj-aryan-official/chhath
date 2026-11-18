import { z } from 'zod';
import { objectId } from './common.js';

export const categoryBody = z.object({
  name: z.string().trim().min(2, 'Category name is too short').max(80),
  nameHi: z.string().trim().max(80).optional(),
  tagline: z.string().trim().max(140).optional(),
  taglineHi: z.string().trim().max(140).optional(),
  description: z.string().trim().max(1000).optional(),
  descriptionHi: z.string().trim().max(1000).optional(),
  image: z.string().trim().max(500).optional(),
  order: z.coerce.number().int().min(0).optional(),
});

export const createCategorySchema = z.object({ body: categoryBody });

export const updateCategorySchema = z.object({
  params: z.object({ id: objectId }),
  body: categoryBody.partial(),
});

export const deleteCategorySchema = z.object({ params: z.object({ id: objectId }) });

export const categorySlugSchema = z.object({
  params: z.object({ slug: z.string().trim().min(1).max(80) }),
});
