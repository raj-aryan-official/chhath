import { z } from 'zod';
import { CHHATH_DAYS, COLOR_FAMILIES, FABRICS } from '../utils/catalog.js';
import { objectId, paginationQuery } from './common.js';

const booleanQuery = z
  .enum(['true', 'false'])
  .optional()
  .transform((value) => (value === undefined ? undefined : value === 'true'));

export const listProductsSchema = z.object({
  query: z.object({
    ...paginationQuery,
    limit: z.coerce.number().int().min(1).max(48).default(12),
    q: z.string().trim().max(100).optional(),
    category: z.string().trim().max(80).optional(),
    fabric: z.enum(FABRICS).optional(),
    color: z.enum(COLOR_FAMILIES).optional(),
    day: z.enum(CHHATH_DAYS).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    rating: z.coerce.number().min(1).max(5).optional(),
    sort: z.enum(['featured', 'newest', 'price-asc', 'price-desc', 'rating']).default('featured'),
    featured: booleanQuery,
  }),
});

const productFields = z.object({
  name: z.string().trim().min(3, 'Name is too short').max(140),
  nameHi: z.string().trim().max(140).optional(),
  shortDescription: z.string().trim().max(220).optional(),
  shortDescriptionHi: z.string().trim().max(220).optional(),
  description: z.string().trim().min(20, 'Description should be at least 20 characters').max(4000),
  descriptionHi: z.string().trim().max(4000).optional(),
  price: z.coerce.number().min(1, 'Price must be greater than zero'),
  mrp: z.coerce.number().min(1, 'MRP must be greater than zero'),
  category: objectId,
  fabric: z.enum(FABRICS),
  day: z.enum(CHHATH_DAYS).optional(),
  color: z.object({
    name: z.enum(COLOR_FAMILIES),
    hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Colour must be a hex value'),
  }),
  sizes: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(60),
        priceDelta: z.coerce.number().min(0).default(0),
      })
    )
    .min(1)
    .max(5)
    .optional(),
  images: z.array(z.string().trim().min(1)).min(1, 'Add at least one image').max(8),
  stock: z.coerce.number().int().min(0),
  blouse: z
    .object({ included: z.boolean(), details: z.string().trim().max(200).default('') })
    .optional(),
  care: z.string().trim().max(300).optional(),
  careHi: z.string().trim().max(300).optional(),
  tags: z.array(z.string().trim().max(30)).max(12).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

const priceSanity = (data) => data.mrp === undefined || data.price === undefined || data.mrp >= data.price;

const productBody = productFields.refine(priceSanity, {
  message: 'MRP must be greater than or equal to the selling price',
  path: ['mrp'],
});

export const createProductSchema = z.object({ body: productBody });

export const updateProductSchema = z.object({
  params: z.object({ id: objectId }),
  body: productFields.partial().refine(priceSanity, {
    message: 'MRP must be greater than or equal to the selling price',
    path: ['mrp'],
  }),
});

export const productIdSchema = z.object({ params: z.object({ id: objectId }) });

export const productSlugSchema = z.object({
  params: z.object({ slug: z.string().trim().min(1).max(120) }),
  query: z.object({ limit: z.coerce.number().int().min(1).max(12).default(4) }).partial(),
});

export const relatedSchema = z.object({
  params: z.object({ slug: z.string().trim().min(1).max(120) }),
});
