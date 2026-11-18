import { env } from '../config/env.js';
import { Product } from '../models/Product.js';
import { Settings } from '../models/Settings.js';
import { ApiError } from './ApiError.js';
import { roundRupees } from './helpers.js';

/**
 * Prices a cart from database records only. Client-sent prices are never trusted.
 */
export async function priceCartItems(rawItems) {
  const ids = [...new Set(rawItems.map((item) => String(item.product)))];
  const products = await Product.find({ _id: { $in: ids }, isActive: true });
  const byId = new Map(products.map((product) => [String(product._id), product]));

  const items = rawItems.map((raw) => {
    const product = byId.get(String(raw.product));
    if (!product) throw ApiError.badRequest('One of the sarees in your cart is no longer available');

    const size = product.sizes.find((option) => option.label === raw.size);
    if (!size) throw ApiError.badRequest(`"${raw.size}" is not offered for ${product.name}`);

    if (product.stock < raw.qty) {
      throw ApiError.conflict(`Only ${product.stock} piece(s) of ${product.name} left in stock`);
    }

    const unitPrice = roundRupees(product.price + (size.priceDelta || 0));
    return {
      product: product._id,
      name: product.name,
      nameHi: product.nameHi || '',
      slug: product.slug,
      image: product.images[0],
      fabric: product.fabric,
      color: product.color?.name || '',
      size: raw.size,
      price: unitPrice,
      qty: raw.qty,
      lineTotal: roundRupees(unitPrice * raw.qty),
    };
  });

  const itemsTotal = roundRupees(items.reduce((sum, item) => sum + item.lineTotal, 0));
  return { items, itemsTotal };
}

export async function getShippingConfig() {
  const settings = await Settings.findOne({ key: 'site' }).lean();
  return {
    fee: settings?.shippingFee ?? env.shipping.fee,
    freeThreshold: settings?.freeShippingThreshold ?? env.shipping.freeThreshold,
  };
}

export const computeShippingFee = (payableBeforeShipping, config) =>
  payableBeforeShipping >= config.freeThreshold ? 0 : config.fee;
