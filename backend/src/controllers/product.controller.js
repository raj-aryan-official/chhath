import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { escapeRegex, slugify } from '../utils/helpers.js';

const SORTS = {
  featured: { isFeatured: -1, soldCount: -1, createdAt: -1 },
  newest: { createdAt: -1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  rating: { ratingsAverage: -1, ratingsCount: -1 },
};

const uniqueSlug = async (name, ignoreId) => {
  const base = slugify(name) || 'saree';
  let slug = base;
  let counter = 2;
  while (await Product.exists({ slug, ...(ignoreId ? { _id: { $ne: ignoreId } } : {}) })) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
};

export const listProducts = asyncHandler(async (req, res) => {
  const query = req.validated.query;
  const filter = { isActive: true };

  if (query.q) {
    const pattern = new RegExp(escapeRegex(query.q), 'i');
    filter.$or = [
      { name: pattern },
      { nameHi: pattern },
      { description: pattern },
      { descriptionHi: pattern },
      { tags: pattern },
    ];
  }

  if (query.category) {
    const category = await Category.findOne({ slug: query.category }).select('_id');
    if (!category) {
      return res.json({
        success: true,
        data: { products: [], page: query.page, pages: 0, total: 0 },
      });
    }
    filter.category = category._id;
  }

  if (query.fabric) filter.fabric = query.fabric;
  if (query.color) filter['color.name'] = query.color;
  if (query.day) filter.day = { $in: [query.day, 'All Days'] };
  if (query.featured !== undefined) filter.isFeatured = query.featured;
  if (query.rating) filter.ratingsAverage = { $gte: query.rating };

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {};
    if (query.minPrice !== undefined) filter.price.$gte = query.minPrice;
    if (query.maxPrice !== undefined) filter.price.$lte = query.maxPrice;
  }

  const skip = (query.page - 1) * query.limit;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name nameHi slug tagline taglineHi')
      .sort(SORTS[query.sort] || SORTS.featured)
      .skip(skip)
      .limit(query.limit),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      products,
      page: query.page,
      pages: Math.ceil(total / query.limit),
      total,
    },
  });
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.validated.params;
  const product = await Product.findOne({ slug }).populate('category', 'name nameHi slug tagline taglineHi');

  const isAdmin = req.user?.role === 'admin';
  if (!product || (!product.isActive && !isAdmin)) {
    throw ApiError.notFound('We could not find that saree');
  }

  res.json({ success: true, data: { product } });
});

export const getRelatedProducts = asyncHandler(async (req, res) => {
  const { slug } = req.validated.params;
  const product = await Product.findOne({ slug }).select('category fabric');
  if (!product) throw ApiError.notFound('We could not find that saree');

  const related = await Product.find({
    _id: { $ne: product._id },
    isActive: true,
    $or: [{ category: product.category }, { fabric: product.fabric }],
  })
    .sort({ isFeatured: -1, soldCount: -1 })
    .limit(4)
    .populate('category', 'name nameHi slug tagline taglineHi');

  res.json({ success: true, data: { products: related } });
});

export const adminListProducts = asyncHandler(async (req, res) => {
  const { page, limit } = req.validated.query;
  const q = req.validated.query.q;

  const filter = {};
  if (q) {
    const pattern = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: pattern }, { slug: pattern }];
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name nameHi slug tagline taglineHi')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({ success: true, data: { products, page, pages: Math.ceil(total / limit), total } });
});

export const createProduct = asyncHandler(async (req, res) => {
  const payload = req.validated.body;

  const category = await Category.findById(payload.category);
  if (!category) throw ApiError.badRequest('Selected category does not exist');

  const product = await Product.create({
    ...payload,
    slug: await uniqueSlug(payload.name),
  });

  res.status(201).json({ success: true, message: 'Saree added', data: { product } });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const payload = req.validated.body;

  const product = await Product.findById(id);
  if (!product) throw ApiError.notFound('Saree not found');

  if (payload.category) {
    const category = await Category.findById(payload.category);
    if (!category) throw ApiError.badRequest('Selected category does not exist');
  }

  if (payload.name && payload.name !== product.name) {
    product.slug = await uniqueSlug(payload.name, product._id);
  }

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined) product[key] = value;
  });

  await product.save();
  res.json({ success: true, message: 'Saree updated', data: { product } });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!product) throw ApiError.notFound('Saree not found');
  res.json({
    success: true,
    message: 'Saree removed from the storefront. Existing orders keep their snapshot.',
    data: { product },
  });
});
