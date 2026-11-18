import { connectDB, disconnectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { Category } from '../models/Category.js';
import { Coupon } from '../models/Coupon.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Review } from '../models/Review.js';
import { Settings } from '../models/Settings.js';
import { User } from '../models/User.js';
import { orderNumber, slugify } from '../utils/helpers.js';
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

const PALETTE = {
  Yellow: '#F5C518',
  Marigold: '#F2A93B',
  Orange: '#EF7B2D',
  Saffron: '#F47B20',
  Red: '#C8342B',
  Maroon: '#7B1E24',
  Pink: '#D4557A',
  Green: '#2F7E5B',
};

const categories = [
  {
    name: 'Tussar Silk',
    tagline: 'Earthy gold, woven in Bhagalpur',
    description:
      'Tussar silk carries a natural golden sheen that catches the evening arghya light. Breathable, textured and quietly regal.',
    order: 1,
  },
  {
    name: 'Bhagalpuri Silk',
    tagline: 'The silk city’s gift to Chhath',
    description:
      'Bhagalpuri silk is sturdy, glossy and made for long hours at the ghat. A beloved choice for parvaitins across Bihar.',
    order: 2,
  },
  {
    name: 'Cotton',
    tagline: 'Soft, simple, sincere',
    description:
      'Pure cotton drapes that stay comfortable through nahay khay and the 36-hour fast. Everyday devotion, dressed with care.',
    order: 3,
  },
  {
    name: 'Banarasi',
    tagline: 'Zari for the most sacred evening',
    description:
      'Banarasi weaves with real zari motifs — suns, vines and waves — for the families who dress up for sandhya arghya.',
    order: 4,
  },
  {
    name: 'Madhubani Print',
    tagline: 'Mithila art on your drape',
    description:
      'Hand-painted Mithila motifs of the sun, soop and diya, printed on soft fabric. A little piece of Mithila to carry to the ghat.',
    order: 5,
  },
  {
    name: 'Georgette',
    tagline: 'Light as the morning arghya',
    description:
      'Flowy georgette sarees with a soft fall, easy to drape when you are standing waist-deep in the river at dawn.',
    order: 6,
  },
];

const products = [
  {
    name: 'Surya Kiran Tussar Silk Saree',
    category: 'Tussar Silk',
    price: 4299,
    mrp: 5999,
    color: 'Yellow',
    day: 'Sandhya Arghya',
    stock: 14,
    featured: true,
    shortDescription: 'Golden tussar with a fine zari border, made for the evening offering.',
    description:
      'A glowing marigold-yellow tussar with a hand-finished zari border. The natural slub of the silk catches the setting sun beautifully, making it a favourite for Sandhya Arghya. Comes with an unstitched blouse piece.',
    tags: ['tussar', 'zari', 'sandhya arghya'],
  },
  {
    name: 'Chhathi Maiya Gold Tussar Saree',
    category: 'Tussar Silk',
    price: 5499,
    mrp: 7499,
    color: 'Marigold',
    day: 'Usha Arghya',
    stock: 9,
    featured: true,
    shortDescription: 'Deep marigold tussar with temple motifs for the dawn offering.',
    description:
      'Woven in deep marigold with delicate temple edging, this tussar is a quiet tribute to Chhathi Maiya. The heavier fall keeps the drape crisp through the early morning arghya.',
    tags: ['tussar', 'temple border', 'usha arghya'],
  },
  {
    name: 'Ganga Ghat Tussar Saree',
    category: 'Tussar Silk',
    price: 3899,
    mrp: 4999,
    color: 'Saffron',
    day: 'Nahay Khay',
    stock: 18,
    featured: false,
    shortDescription: 'Saffron tussar with a soft wave border inspired by the ghat steps.',
    description:
      'A warm saffron tussar with a woven wave border that echoes the ghat steps at dusk. Light enough for the ritual bath and the first pure meal of Nahay Khay.',
    tags: ['tussar', 'wave border', 'nahay khay'],
  },
  {
    name: 'Madhuban Tussar Zari Saree',
    category: 'Tussar Silk',
    price: 6299,
    mrp: 7999,
    color: 'Orange',
    day: 'Kharna',
    stock: 7,
    featured: true,
    shortDescription: 'Burnt-orange tussar with all-over zari buti for Kharna evening.',
    description:
      'Burnt orange tussar scattered with small zari butis, chosen for the evening of Kharna when the family gathers for rasiao-kheer. Traditional, warm and made to be kept for years.',
    tags: ['tussar', 'zari buti', 'kharna'],
  },
  {
    name: 'Usha Prabhat Tussar Saree',
    category: 'Tussar Silk',
    price: 4799,
    mrp: 6299,
    color: 'Yellow',
    day: 'Usha Arghya',
    stock: 11,
    featured: false,
    shortDescription: 'Pale gold tussar that mirrors the first light on the water.',
    description:
      'Pale gold tussar with a narrow copper border, inspired by the first light on the river. Drapes softly and photographs beautifully at the Usha Arghya.',
    tags: ['tussar', 'copper border', 'usha arghya'],
  },
  {
    name: 'Bhagalpur Barsana Silk Saree',
    category: 'Bhagalpuri Silk',
    price: 3499,
    mrp: 4599,
    color: 'Red',
    day: 'Sandhya Arghya',
    stock: 20,
    featured: true,
    shortDescription: 'Classic red Bhagalpuri silk with a broad gold border.',
    description:
      'The classic red-and-gold Bhagalpuri drape, sturdy enough for hours at the ghat and bright enough for the evening photographs. A dependable favourite for Sandhya Arghya.',
    tags: ['bhagalpuri', 'red', 'gold border'],
  },
  {
    name: 'Sonpur Mela Bhagalpuri Saree',
    category: 'Bhagalpuri Silk',
    price: 2899,
    mrp: 3799,
    color: 'Maroon',
    day: 'All Days',
    stock: 16,
    featured: false,
    shortDescription: 'Deep maroon silk with a fine checked pallu.',
    description:
      'A deep maroon Bhagalpuri with a fine checked pallu, inspired by the textiles sold at the Sonpur fair. Understated enough to wear beyond the festival too.',
    tags: ['bhagalpuri', 'checked pallu', 'maroon'],
  },
  {
    name: 'Maithili Resham Bhagalpuri Saree',
    category: 'Bhagalpuri Silk',
    price: 3199,
    mrp: 4199,
    color: 'Saffron',
    day: 'Kharna',
    stock: 12,
    featured: false,
    shortDescription: 'Saffron silk with a woven soop motif on the pallu.',
    description:
      'Saffron Bhagalpuri silk with a small woven soop motif on the pallu — a quiet nod to the winnowing tray at the heart of Chhath. Comes with a matching blouse piece.',
    tags: ['bhagalpuri', 'soop motif', 'kharna'],
  },
  {
    name: 'Kosi Kinara Bhagalpuri Silk',
    category: 'Bhagalpuri Silk',
    price: 2599,
    mrp: 3499,
    color: 'Orange',
    day: 'Nahay Khay',
    stock: 22,
    featured: false,
    shortDescription: 'Everyday orange silk with a soft sheen and simple border.',
    description:
      'An easy orange Bhagalpuri for the first day of Chhath. Simple border, soft sheen and a drape that stays put during the river bath and the kaddu-bhaat meal.',
    tags: ['bhagalpuri', 'everyday', 'nahay khay'],
  },
  {
    name: 'Rajghat Tassar Bhagalpuri',
    category: 'Bhagalpuri Silk',
    price: 3999,
    mrp: 5299,
    color: 'Yellow',
    day: 'Sandhya Arghya',
    stock: 10,
    featured: false,
    shortDescription: 'Golden Bhagalpuri with a hand-knotted tassel finish.',
    description:
      'Golden Bhagalpuri silk finished with small hand-knotted tassels. The kind of saree a mother passes to a daughter for her first Chhath as a parvaitin.',
    tags: ['bhagalpuri', 'tassels', 'heirloom'],
  },
  {
    name: 'Chhath Ghat Cotton Saree',
    category: 'Cotton',
    price: 1299,
    mrp: 1899,
    color: 'Yellow',
    day: 'Sandhya Arghya',
    stock: 40,
    featured: true,
    shortDescription: 'Breathable yellow cotton with a woven diya border.',
    description:
      'A light yellow handloom cotton with a woven diya border. Breathable and easy to manage when you are standing in the water with the soop in your hands.',
    tags: ['cotton', 'handloom', 'diya border'],
  },
  {
    name: 'Bihari Baag Cotton Saree',
    category: 'Cotton',
    price: 1499,
    mrp: 1999,
    color: 'Orange',
    day: 'All Days',
    stock: 35,
    featured: false,
    shortDescription: 'Traditional orange cotton with a temple-edged pallu.',
    description:
      'An everyday orange cotton with a temple-edged pallu, woven in the Bihari baag style. Softens with every wash and grows more comfortable each year.',
    tags: ['cotton', 'temple pallu', 'everyday'],
  },
  {
    name: 'Suryoday Cotton Handloom Saree',
    category: 'Cotton',
    price: 1099,
    mrp: 1599,
    color: 'Saffron',
    day: 'Usha Arghya',
    stock: 44,
    featured: true,
    shortDescription: 'Fresh saffron handloom for the dawn offering.',
    description:
      'Fresh saffron handloom cotton with a plain body and a contrasting border. Made for Usha Arghya, when the whole family walks to the ghat before sunrise.',
    tags: ['cotton', 'handloom', 'saffron'],
  },
  {
    name: 'Kaddu Bhaat Cotton Saree',
    category: 'Cotton',
    price: 999,
    mrp: 1399,
    color: 'Marigold',
    day: 'Nahay Khay',
    stock: 50,
    featured: false,
    shortDescription: 'Marigold cotton for the first pure meal of Chhath.',
    description:
      'A gentle marigold cotton for Nahay Khay — simple, pure and comfortable, the way the first day of Chhath asks you to be.',
    tags: ['cotton', 'nahay khay', 'simple'],
  },
  {
    name: 'Patna Bazaar Cotton Saree',
    category: 'Cotton',
    price: 1199,
    mrp: 1699,
    color: 'Red',
    day: 'Kharna',
    stock: 38,
    featured: false,
    shortDescription: 'Red cotton with a fine white stripe and soft fall.',
    description:
      'A red cotton with a fine white stripe, the kind sold in the old lanes of Patna Bazaar. Crisp, cool and easy to drape through the long Kharna fast.',
    tags: ['cotton', 'stripes', 'kharna'],
  },
  {
    name: 'Bihar Cotton Daily Drape',
    category: 'Cotton',
    price: 799,
    mrp: 1099,
    color: 'Green',
    day: 'All Days',
    stock: 60,
    featured: false,
    shortDescription: 'An honest everyday cotton drape in deep green.',
    description:
      'A simple green cotton for daily wear and the quieter moments of the festival. Nothing fussy — just clean fabric, a neat border and an easy fall.',
    tags: ['cotton', 'everyday', 'budget'],
  },
  {
    name: 'Kashi Surya Banarasi Saree',
    category: 'Banarasi',
    price: 8999,
    mrp: 11999,
    color: 'Red',
    day: 'Usha Arghya',
    stock: 6,
    featured: true,
    shortDescription: 'Crimson Banarasi with a sunburst zari pallu.',
    description:
      'A crimson Banarasi with a sunburst zari pallu, woven in the old Kashi tradition. Reserved for the dawn arghya, when the sun itself is the guest of honour.',
    tags: ['banarasi', 'zari', 'sunburst'],
  },
  {
    name: 'Banaras Zari Kiran Saree',
    category: 'Banarasi',
    price: 10999,
    mrp: 13999,
    color: 'Maroon',
    day: 'Sandhya Arghya',
    stock: 4,
    featured: true,
    shortDescription: 'Maroon katan silk with dense zari kiran border.',
    description:
      'Deep maroon katan silk with a dense zari kiran border and a richly worked pallu. The most formal saree in the collection, made for the evening of Sandhya Arghya.',
    tags: ['banarasi', 'katan silk', 'kiran border'],
  },
  {
    name: 'Sindoori Banarasi Silk Saree',
    category: 'Banarasi',
    price: 7499,
    mrp: 9999,
    color: 'Orange',
    day: 'Kharna',
    stock: 8,
    featured: false,
    shortDescription: 'Sindoor-orange Banarasi with floral zari jaal.',
    description:
      'A sindoor-orange Banarasi with a floral zari jaal across the body. Rich without being loud, it pairs beautifully with a traditional sindoor finish for Kharna.',
    tags: ['banarasi', 'zari jaal', 'sindoor'],
  },
  {
    name: 'Swarna Ghat Banarasi Saree',
    category: 'Banarasi',
    price: 9499,
    mrp: 12999,
    color: 'Yellow',
    day: 'Usha Arghya',
    stock: 5,
    featured: false,
    shortDescription: 'Gold Banarasi with ghat and wave motifs on the border.',
    description:
      'A gold Banarasi with ghat and wave motifs woven into the border. Heavy, luminous and made to catch the first light of Usha Arghya on the water.',
    tags: ['banarasi', 'gold', 'ghat motif'],
  },
  {
    name: 'Mithila Madhubani Saree',
    category: 'Madhubani Print',
    price: 2199,
    mrp: 2999,
    color: 'Yellow',
    day: 'All Days',
    stock: 25,
    featured: true,
    shortDescription: 'Sun and fish motifs printed in the Mithila tradition.',
    description:
      'Sun, fish and lotus motifs printed in the Mithila tradition on a soft yellow base. A wearable piece of Madhubani art, ideal for families who love handcrafted detail.',
    tags: ['madhubani', 'mithila', 'printed'],
  },
  {
    name: 'Surya Madhubani Print Saree',
    category: 'Madhubani Print',
    price: 2499,
    mrp: 3299,
    color: 'Orange',
    day: 'Sandhya Arghya',
    stock: 18,
    featured: false,
    shortDescription: 'Orange Madhubani print with a radiating sun pallu.',
    description:
      'A radiating sun fills the pallu of this orange Madhubani print — an unmistakable tribute to Surya Dev. The print is crisp, the base fabric soft and lightweight.',
    tags: ['madhubani', 'sun motif', 'printed'],
  },
  {
    name: 'Soop aur Diya Madhubani Saree',
    category: 'Madhubani Print',
    price: 2699,
    mrp: 3499,
    color: 'Red',
    day: 'Kharna',
    stock: 14,
    featured: false,
    shortDescription: 'Red Madhubani print featuring soop, diya and sugarcane.',
    description:
      'Soop, diya and sugarcane stalks — the offerings of Chhath — drawn in fine Madhubani line work on a deep red base. A saree that tells the story of the festival.',
    tags: ['madhubani', 'soop', 'printed'],
  },
  {
    name: 'Janakpur Madhubani Cotton Saree',
    category: 'Madhubani Print',
    price: 1899,
    mrp: 2499,
    color: 'Saffron',
    day: 'Nahay Khay',
    stock: 21,
    featured: false,
    shortDescription: 'Saffron cotton with Janakpur-style border art.',
    description:
      'Saffron cotton printed with Janakpur-style border art, light enough for the first day of the festival. A comfortable drape with a lot of character.',
    tags: ['madhubani', 'cotton', 'janakpur'],
  },
  {
    name: 'Nadiya Kinare Georgette Saree',
    category: 'Georgette',
    price: 1899,
    mrp: 2599,
    color: 'Pink',
    day: 'Sandhya Arghya',
    stock: 26,
    featured: false,
    shortDescription: 'Soft pink georgette with a delicate sequin wave border.',
    description:
      'A soft pink georgette with a delicate sequin wave border that glimmers like the river at dusk. Light, flowy and easy to drape for Sandhya Arghya.',
    tags: ['georgette', 'sequin', 'wave border'],
  },
  {
    name: 'Surya Kund Georgette Saree',
    category: 'Georgette',
    price: 2199,
    mrp: 2899,
    color: 'Yellow',
    day: 'Usha Arghya',
    stock: 19,
    featured: true,
    shortDescription: 'Sunlit yellow georgette with a fine gota edging.',
    description:
      'Sunlit yellow georgette finished with a fine gota edging. The fabric moves beautifully and stays light through the early morning arghya.',
    tags: ['georgette', 'gota', 'usha arghya'],
  },
  {
    name: 'Diya Jalti Georgette Saree',
    category: 'Georgette',
    price: 1999,
    mrp: 2699,
    color: 'Orange',
    day: 'All Days',
    stock: 23,
    featured: false,
    shortDescription: 'Orange georgette with tiny embroidered diya motifs.',
    description:
      'Tiny embroidered diya motifs scatter across a warm orange georgette, like lamps floating on the river. Comfortable enough for a full day of rituals.',
    tags: ['georgette', 'diya motif', 'embroidered'],
  },
  {
    name: 'Ghat Aarti Georgette Saree',
    category: 'Georgette',
    price: 2299,
    mrp: 2999,
    color: 'Maroon',
    day: 'Kharna',
    stock: 15,
    featured: false,
    shortDescription: 'Maroon georgette with a gold-thread aarti border.',
    description:
      'A maroon georgette with a gold-thread aarti border, inspired by the lamps that line the ghats on Kharna evening. Understated shine for a night of prayer.',
    tags: ['georgette', 'aarti border', 'kharna'],
  },
];

const reviewsSeed = [
  {
    product: 'Surya Kiran Tussar Silk Saree',
    email: 'demo@kharna.in',
    rating: 5,
    title: 'Exactly like the photos',
    comment:
      'Wore this for sandhya arghya and received so many compliments at the ghat. The zari border is neat and the colour is a true marigold.',
  },
  {
    product: 'Surya Kiran Tussar Silk Saree',
    email: 'ritika@example.com',
    rating: 4,
    title: 'Beautiful, slightly heavy',
    comment:
      'Lovely fabric and finish. It is a little heavy for a long standing arghya, but that is tussar for you. Worth it.',
  },
  {
    product: 'Chhath Ghat Cotton Saree',
    email: 'ritika@example.com',
    rating: 5,
    title: 'So comfortable in the water',
    comment:
      'Draped this for the evening offering and it stayed light the whole time. The diya border is subtle and pretty.',
  },
  {
    product: 'Mithila Madhubani Saree',
    email: 'demo@kharna.in',
    rating: 5,
    title: 'The print is stunning',
    comment:
      'The sun and fish motifs are printed clearly and the fabric is soft. My mother asked where I bought it for next year.',
  },
];

const run = async () => {
  if (env.isProduction && process.env.FORCE_SEED !== 'true') {
    console.error(
      '[seed] Refusing to run in production. Set FORCE_SEED=true if you really mean to reset the database.'
    );
    process.exit(1);
  }

  await connectDB();
  console.log('[seed] Clearing existing data…');

  await Promise.all([
    Category.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    Review.deleteMany({}),
    Coupon.deleteMany({}),
    Settings.deleteMany({}),
    User.deleteMany({}),
  ]);

  const admin = await User.create({
    name: env.admin.name,
    email: env.admin.email,
    password: env.admin.password,
    role: 'admin',
    phone: '9876543210',
  });

  const demo = await User.create({
    name: 'Aarti Sharma',
    email: 'demo@kharna.in',
    password: 'Demo@12345',
    phone: '9812345678',
    addresses: [
      {
        label: 'Home',
        fullName: 'Aarti Sharma',
        line1: 'House 24, Lane 5, Rajendra Nagar',
        line2: 'Near Kali Mandir',
        city: 'Patna',
        state: 'Bihar',
        pincode: '800016',
        phone: '9812345678',
        isDefault: true,
      },
    ],
  });

  const ritika = await User.create({
    name: 'Ritika Jha',
    email: 'ritika@example.com',
    password: 'Demo@12345',
    phone: '9898765432',
  });

  console.log('[seed] Creating collections…');
  const categoryDocs = await Category.insertMany(
    categories.map((category) => ({
      ...category,
      ...(CATEGORY_HI[category.name] || {}),
      slug: slugify(category.name),
      image: categoryImage(category.name),
    }))
  );
  const categoryByName = new Map(categoryDocs.map((doc) => [doc.name, doc]));

  console.log(`[seed] Creating ${products.length} sarees…`);
  const productDocs = await Product.insertMany(
    products.map((product) => {
      const hi = PRODUCT_HI[product.name] || {};
      return {
        name: product.name,
        nameHi: hi.nameHi || '',
        slug: slugify(product.name),
        shortDescription: product.shortDescription,
        shortDescriptionHi: hi.shortDescriptionHi || '',
        description: product.description,
        descriptionHi: hi.descriptionHi || '',
        price: hi.price ?? product.price,
        mrp: hi.mrp ?? product.mrp,
        category: categoryByName.get(product.category)._id,
        fabric: product.category,
        day: product.day,
        color: { name: product.color, hex: PALETTE[product.color] },
        images: [...new Set([productImage(product.name), secondaryImage(product.category)])],
        stock: product.stock,
        care:
          product.category === 'Cotton'
            ? 'Hand wash separately in cold water. Do not wring or bleach.'
            : 'Dry clean only. Store wrapped in muslin away from direct sunlight.',
        careHi: CARE_HI[product.category] || CARE_HI.default,
        tags: product.tags,
        soldCount: Math.floor(Math.random() * 40),
        isFeatured: Boolean(product.featured),
      };
    })
  );
  const productByName = new Map(productDocs.map((doc) => [doc.name, doc]));

  console.log('[seed] Creating demo reviews…');
  for (const review of reviewsSeed) {
    const product = productByName.get(review.product);
    const user = review.email === demo.email ? demo : ritika;
    await Review.create({
      product: product._id,
      user: user._id,
      name: user.name,
      rating: review.rating,
      title: review.title,
      titleHi: REVIEW_HI[review.title]?.titleHi || '',
      comment: review.comment,
      commentHi: REVIEW_HI[review.title]?.commentHi || '',
    });
  }

  for (const product of productDocs) {
    const productReviews = await Review.find({ product: product._id });
    if (productReviews.length > 0) {
      const average =
        productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length;
      product.ratingsAverage = Math.round(average * 10) / 10;
      product.ratingsCount = productReviews.length;
      await product.save();
    }
  }

  console.log('[seed] Creating coupons…');
  await Coupon.insertMany([
    {
      code: 'CHHATH10',
      description: '10% off your Chhath order, up to ₹1,000',
      descriptionHi: COUPON_HI.CHHATH10,
      type: 'percent',
      value: 10,
      minOrder: 1999,
      maxDiscount: 1000,
      usageLimit: 500,
      isActive: true,
    },
    {
      code: 'SURYODAY500',
      description: 'Flat ₹500 off orders above ₹3,999',
      descriptionHi: COUPON_HI.SURYODAY500,
      type: 'fixed',
      value: 500,
      minOrder: 3999,
      isActive: true,
    },
    {
      code: 'NEW200',
      description: 'Flat ₹200 off your first order above ₹1,499',
      descriptionHi: COUPON_HI.NEW200,
      type: 'fixed',
      value: 200,
      minOrder: 1499,
      isActive: true,
    },
  ]);

  console.log('[seed] Creating a store settings record…');
  await Settings.create({
    key: 'site',
    chhathDate: new Date('2027-11-05T06:00:00+05:30'),
    heroHeadline: 'Dress your devotion in gold and saffron',
    heroSubline:
      'Handpicked sarees for every day of Chhath, from Nahay Khay to Usha Arghya — woven for the women who keep the light.',
    ...SETTINGS_HI,
    contact: {
      phone: '',
      email: 'hello@kharna.in',
      address: '',
    },
  });

  console.log('[seed] Creating sample orders…');
  const demoOrderProducts = [
    productByName.get('Surya Kiran Tussar Silk Saree'),
    productByName.get('Chhath Ghat Cotton Saree'),
    productByName.get('Mithila Madhubani Saree'),
  ];

  const buildItem = (product, qty = 1) => ({
    product: product._id,
    name: product.name,
    nameHi: product.nameHi || '',
    slug: product.slug,
    image: product.images[0],
    fabric: product.fabric,
    color: product.color.name,
    size: 'Free Size',
    price: product.price,
    qty,
  });

  const shippedItem = buildItem(demoOrderProducts[0]);
  const deliveredItem = buildItem(demoOrderProducts[1]);
  const placedItem = buildItem(demoOrderProducts[2]);

  await Order.create([
    {
      orderNumber: orderNumber(),
      user: demo._id,
      items: [placedItem],
      shippingAddress: {
        fullName: 'Aarti Sharma',
        line1: 'House 24, Lane 5, Rajendra Nagar',
        line2: 'Near Kali Mandir',
        city: 'Patna',
        state: 'Bihar',
        pincode: '800016',
        phone: '9812345678',
      },
      itemsTotal: placedItem.price,
      discount: 0,
      shippingFee: 79,
      total: placedItem.price + 79,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      status: 'placed',
      statusHistory: [{ status: 'placed', note: 'Order placed', at: new Date() }],
      deliveryEstimate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    },
    {
      orderNumber: orderNumber(),
      user: demo._id,
      items: [shippedItem],
      shippingAddress: {
        fullName: 'Aarti Sharma',
        line1: 'House 24, Lane 5, Rajendra Nagar',
        line2: 'Near Kali Mandir',
        city: 'Patna',
        state: 'Bihar',
        pincode: '800016',
        phone: '9812345678',
      },
      itemsTotal: shippedItem.price,
      discount: 0,
      shippingFee: 0,
      total: shippedItem.price,
      paymentMethod: 'razorpay',
      paymentStatus: 'paid',
      status: 'shipped',
      razorpayOrderId: 'order_demo_shipped',
      razorpayPaymentId: 'pay_demo_shipped',
      statusHistory: [
        { status: 'placed', note: 'Order placed', at: new Date(Date.now() - 5 * 86400000) },
        { status: 'confirmed', note: 'Payment received', at: new Date(Date.now() - 5 * 86400000) },
        { status: 'packed', note: 'Packed with care', at: new Date(Date.now() - 4 * 86400000) },
        { status: 'shipped', note: 'Handed over to the courier', at: new Date(Date.now() - 3 * 86400000) },
      ],
      deliveryEstimate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      orderNumber: orderNumber(),
      user: ritika._id,
      items: [deliveredItem],
      shippingAddress: {
        fullName: 'Ritika Jha',
        line1: 'Flat 3B, Surya Apartments, Boring Road',
        line2: '',
        city: 'Patna',
        state: 'Bihar',
        pincode: '800001',
        phone: '9898765432',
      },
      itemsTotal: deliveredItem.price,
      discount: 200,
      shippingFee: 0,
      total: deliveredItem.price - 200,
      couponCode: 'NEW200',
      paymentMethod: 'cod',
      paymentStatus: 'paid',
      status: 'delivered',
      statusHistory: [
        { status: 'placed', note: 'Order placed', at: new Date(Date.now() - 20 * 86400000) },
        { status: 'confirmed', note: '', at: new Date(Date.now() - 19 * 86400000) },
        { status: 'packed', note: '', at: new Date(Date.now() - 18 * 86400000) },
        { status: 'shipped', note: '', at: new Date(Date.now() - 17 * 86400000) },
        { status: 'delivered', note: 'Delivered to customer', at: new Date(Date.now() - 14 * 86400000) },
      ],
      deliveryEstimate: new Date(Date.now() - 14 * 86400000),
    },
  ]);

  console.log('\n──────────────────────────────────────────────');
  console.log('  KHARNA seed complete');
  console.log('──────────────────────────────────────────────');
  console.log(`  Collections: ${categoryDocs.length}`);
  console.log(`  Sarees:      ${productDocs.length}`);
  console.log(`  Admin:       ${admin.email} / ${env.admin.password}`);
  console.log('  Customer:    demo@kharna.in / Demo@12345');
  console.log('  Customer:    ritika@example.com / Demo@12345');
  console.log('  Coupons:     CHHATH10, SURYODAY500, NEW200');
  console.log('──────────────────────────────────────────────\n');

  await disconnectDB();
  process.exit(0);
};

run().catch(async (error) => {
  console.error('[seed] Failed', error);
  await disconnectDB();
  process.exit(1);
});
