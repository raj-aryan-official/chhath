import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { slugify } from '../utils/helpers.js';

const uniqueCategorySlug = async (name, ignoreId) => {
  const base = slugify(name) || 'collection';
  let slug = base;
  let counter = 2;
  while (await Category.exists({ slug, ...(ignoreId ? { _id: { $ne: ignoreId } } : {}) })) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
};

export const listCategories = asyncHandler(async (_req, res) => {
  const [categories, counts] = await Promise.all([
    Category.find().sort({ order: 1, name: 1 }).lean(),
    Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]),
  ]);

  const countMap = new Map(counts.map((entry) => [String(entry._id), entry.count]));
  res.json({
    success: true,
    data: {
      categories: categories.map((category) => ({
        ...category,
        productCount: countMap.get(String(category._id)) || 0,
      })),
    },
  });
});

export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.validated.params;
  const category = await Category.findOne({ slug });
  if (!category) throw ApiError.notFound('Collection not found');
  res.json({ success: true, data: { category } });
});

export const createCategory = asyncHandler(async (req, res) => {
  const payload = req.validated.body;
  const category = await Category.create({ ...payload, slug: await uniqueCategorySlug(payload.name) });
  res.status(201).json({ success: true, message: 'Collection created', data: { category } });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const payload = req.validated.body;

  const category = await Category.findById(id);
  if (!category) throw ApiError.notFound('Collection not found');

  if (payload.name && payload.name !== category.name) {
    category.slug = await uniqueCategorySlug(payload.name, category._id);
  }

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined) category[key] = value;
  });

  await category.save();
  res.json({ success: true, message: 'Collection updated', data: { category } });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const products = await Product.countDocuments({ category: id });
  if (products > 0) {
    throw ApiError.conflict(
      `This collection still has ${products} saree(s). Move or remove them before deleting it.`
    );
  }
  const category = await Category.findByIdAndDelete(id);
  if (!category) throw ApiError.notFound('Collection not found');
  res.json({ success: true, message: 'Collection deleted' });
});
