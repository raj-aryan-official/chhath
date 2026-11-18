import { connectDB, disconnectDB } from '../config/db.js';
import { Category } from '../models/Category.js';
import { Coupon } from '../models/Coupon.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Review } from '../models/Review.js';
import { Settings } from '../models/Settings.js';
import {
  CARE_HI,
  CATEGORY_HI,
  categoryImage,
  COUPON_HI,
  PRODUCT_HI,
  productImage,
  REVIEW_HI,
  secondaryImage,
  SETTINGS_HI,
} from './hindi-catalog.js';

const run = async () => {
  await connectDB();

  let categories = 0;
  for (const [name, hi] of Object.entries(CATEGORY_HI)) {
    const result = await Category.updateOne(
      { name },
      {
        $set: {
          nameHi: hi.nameHi,
          taglineHi: hi.taglineHi,
          descriptionHi: hi.descriptionHi,
          image: categoryImage(name),
        },
      }
    );
    categories += result.modifiedCount;
  }

  let products = 0;
  let orders = 0;
  for (const [name, hi] of Object.entries(PRODUCT_HI)) {
    const product = await Product.findOne({ name });
    if (!product) continue;

    await Product.updateOne(
      { _id: product._id },
      {
        $set: {
          nameHi: hi.nameHi,
          shortDescriptionHi: hi.shortDescriptionHi,
          descriptionHi: hi.descriptionHi,
          price: hi.price,
          mrp: hi.mrp,
          images: [...new Set([productImage(name), secondaryImage(product.fabric)])],
          careHi: CARE_HI[product.fabric] || CARE_HI.default,
        },
      }
    );
    products += 1;

    const orderResult = await Order.updateMany(
      { 'items.name': name },
      { $set: { 'items.$[item].nameHi': hi.nameHi } },
      { arrayFilters: [{ 'item.name': name }] }
    );
    orders += orderResult.modifiedCount;
  }

  let reviews = 0;
  for (const [title, hi] of Object.entries(REVIEW_HI)) {
    const result = await Review.updateMany(
      { title },
      { $set: { titleHi: hi.titleHi, commentHi: hi.commentHi } }
    );
    reviews += result.modifiedCount;
  }

  let coupons = 0;
  for (const [code, descriptionHi] of Object.entries(COUPON_HI)) {
    const result = await Coupon.updateOne({ code }, { $set: { descriptionHi } });
    coupons += result.modifiedCount;
  }

  const settings = await Settings.updateMany({}, { $set: SETTINGS_HI });

  console.log(
    `[hindi] categories ${categories} · products ${products} · orders ${orders} · reviews ${reviews} · coupons ${coupons} · settings ${settings.modifiedCount}`
  );

  await disconnectDB();
};

run().catch(async (error) => {
  console.error('[hindi] failed:', error.message);
  try {
    await disconnectDB();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
