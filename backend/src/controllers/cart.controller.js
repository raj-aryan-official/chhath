import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { roundRupees } from '../utils/helpers.js';
import { getShippingConfig } from '../utils/pricing.js';

const populateCart = (userId) =>
  Cart.findOne({ user: userId }).populate({
    path: 'items.product',
    select: 'name nameHi slug price images stock sizes fabric color isActive',
  });

export async function serializeCart(cart) {
  const { fee, freeThreshold } = await getShippingConfig();
  const items = [];

  for (const item of cart?.items ?? []) {
    const product = item.product;
    if (!product || !product.isActive) continue;

    const size = product.sizes.find((option) => option.label === item.size);
    if (!size) continue;

    const qty = Math.min(item.qty, product.stock);
    if (qty < 1) continue;

    const unitPrice = roundRupees(product.price + (size.priceDelta || 0));
    items.push({
      itemId: item._id,
      productId: product._id,
      name: product.name,
      nameHi: product.nameHi || '',
      slug: product.slug,
      image: product.images[0],
      fabric: product.fabric,
      color: product.color?.name || '',
      size: item.size,
      qty,
      stock: product.stock,
      unitPrice,
      lineTotal: roundRupees(unitPrice * qty),
    });
  }

  const itemsTotal = roundRupees(items.reduce((sum, item) => sum + item.lineTotal, 0));
  const shippingFee = items.length === 0 || itemsTotal >= freeThreshold ? 0 : fee;

  return {
    items,
    itemCount: items.reduce((sum, item) => sum + item.qty, 0),
    itemsTotal,
    shippingFee,
    freeShippingThreshold: freeThreshold,
    total: roundRupees(itemsTotal + shippingFee),
  };
}

const respondWithCart = async (res, userId, status = 200) => {
  const cart = await populateCart(userId);
  res.status(status).json({ success: true, data: { cart: await serializeCart(cart) } });
};

export const getCart = asyncHandler(async (req, res) => {
  await respondWithCart(res, req.user._id);
});

export const addToCart = asyncHandler(async (req, res) => {
  const { product: productId, size: sizeLabel, qty } = req.validated.body;

  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) throw ApiError.notFound('That saree is no longer available');

  if (!product.sizes.some((size) => size.label === sizeLabel)) {
    throw ApiError.badRequest('Please choose a valid size option');
  }
  if (product.stock < 1) throw ApiError.conflict('This saree just went out of stock');

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const cap = Math.min(10, product.stock);
  const existing = cart.items.find(
    (item) => String(item.product) === String(product._id) && item.size === sizeLabel
  );

  if (existing) {
    existing.qty = Math.min(existing.qty + qty, cap);
  } else {
    cart.items.push({ product: product._id, size: sizeLabel, qty: Math.min(qty, cap) });
  }

  await cart.save();
  await respondWithCart(res, req.user._id, 201);
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.validated.params;
  const { qty } = req.validated.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw ApiError.notFound('Cart is empty');

  const item = cart.items.id(itemId);
  if (!item) throw ApiError.notFound('That item is not in your cart');

  const product = await Product.findById(item.product).select('stock name');
  if (!product) throw ApiError.notFound('That saree is no longer available');

  item.qty = Math.min(qty, Math.max(1, product.stock), 10);
  await cart.save();

  await respondWithCart(res, req.user._id);
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.validated.params;
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items.pull({ _id: itemId });
    await cart.save();
  }
  await respondWithCart(res, req.user._id);
});

export const clearCart = asyncHandler(async (req, res) => {
  await Cart.updateOne({ user: req.user._id }, { $set: { items: [] } });
  await respondWithCart(res, req.user._id);
});

export const mergeCart = asyncHandler(async (req, res) => {
  const incoming = req.validated.body.items;

  const products = await Product.find({
    _id: { $in: incoming.map((item) => item.product) },
    isActive: true,
  });
  const byId = new Map(products.map((product) => [String(product._id), product]));

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  for (const incomingItem of incoming) {
    const product = byId.get(String(incomingItem.product));
    if (!product) continue;
    if (!product.sizes.some((size) => size.label === incomingItem.size)) continue;
    if (product.stock < 1) continue;

    const cap = Math.min(10, product.stock);
    const existing = cart.items.find(
      (item) => String(item.product) === String(product._id) && item.size === incomingItem.size
    );

    if (existing) {
      existing.qty = Math.min(existing.qty + incomingItem.qty, cap);
    } else {
      cart.items.push({
        product: product._id,
        size: incomingItem.size,
        qty: Math.min(incomingItem.qty, cap),
      });
    }
  }

  await cart.save();
  await respondWithCart(res, req.user._id);
});
