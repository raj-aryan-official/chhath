import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { escapeRegex } from '../utils/helpers.js';

export const getDashboardStats = asyncHandler(async (_req, res) => {
  const since = new Date(Date.now() - 13 * 24 * 60 * 60 * 1000);
  since.setHours(0, 0, 0, 0);

  const [orderCount, revenue, customerCount, lowStock, recentOrders, salesByDay, topProducts, byStatus] =
    await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      User.countDocuments({ role: 'customer' }),
      Product.find({ isActive: true, stock: { $lte: 5 } })
        .select('name slug stock images price')
        .sort({ stock: 1 })
        .limit(8),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .select('orderNumber total status paymentMethod paymentStatus createdAt user')
        .populate('user', 'name email'),
      Order.aggregate([
        { $match: { createdAt: { $gte: since }, status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Kolkata' },
            },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Product.find({ isActive: true })
        .sort({ soldCount: -1 })
        .limit(5)
        .select('name slug soldCount price images'),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

  res.json({
    success: true,
    data: {
      totals: {
        revenue: revenue[0]?.total || 0,
        orders: orderCount,
        customers: customerCount,
        lowStock: lowStock.length,
      },
      salesByDay,
      topProducts,
      byStatus,
      recentOrders,
      lowStock,
    },
  });
});

export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit } = req.validated.query;
  const q = req.validated.query.q;

  const filter = { role: 'customer' };
  if (q) {
    const pattern = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: pattern }, { email: pattern }, { phone: pattern }];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('name email phone createdAt addresses')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  res.json({ success: true, data: { users, page, pages: Math.ceil(total / limit), total } });
});
