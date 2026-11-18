import { z } from 'zod';
import { objectId } from './common.js';

export const wishlistParamsSchema = z.object({
  params: z.object({ productId: objectId }),
});
