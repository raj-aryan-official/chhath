import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertTriangle, IndianRupee, Package, RefreshCw, ShoppingBag, Users } from 'lucide-react';
import Seo from '../../components/seo/Seo.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { fetchStats } from '../../services/admin.service.js';
import { formatDate, formatDateTime, formatINR } from '../../utils/format.js';
import { ORDER_STATUS } from '../../utils/constants.js';

const STATUS_TONE = {
  placed: 'sun',
  confirmed: 'flame',
  packed: 'flame',
  shipped: 'sun',
  delivered: 'success',
  cancelled: 'neutral',
};

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="card-warm p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-bamboo-600">{label}</p>
          <p className="mt-2 font-display text-3xl text-ink">{value}</p>
          {hint && <p className="mt-1 text-xs text-bamboo-600">{hint}</p>}
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sun-100 text-flame-700">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-sun-300 bg-cream px-3 py-2 text-xs shadow-warm">
      <p className="font-medium text-ink">{label}</p>
      <p className="mt-1 text-bamboo-700">{formatINR(payload[0].value)}</p>
      <p className="text-bamboo-600">{payload[0].payload.orders} orders</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      setStats(await fetchStats());
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const chartData = (stats?.salesByDay || []).map((day) => ({
    ...day,
    label: formatDate(`${day._id}T00:00:00+05:30`, { day: 'numeric', month: 'short' }),
  }));

  const statusCounts = Object.keys(ORDER_STATUS).map((key) => ({
    key,
    ...ORDER_STATUS[key],
    count: stats?.byStatus?.find((entry) => entry._id === key)?.count || 0,
  }));
  const maxStatus = Math.max(1, ...statusCounts.map((entry) => entry.count));

  return (
    <div className="space-y-6">
      <Seo title="Store dashboard" description="KHARNA admin overview" noIndex />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Overview</p>
          <h1 className="mt-1 font-display text-3xl text-ink">Namaste, the store at a glance</h1>
          <p className="mt-1 text-sm text-bamboo-700">
            Revenue, orders and stock across the last fourteen days.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={load} loading={status === 'loading'}>
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Refresh
        </Button>
      </div>

      {status === 'error' && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {status === 'loading' && !stats ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={IndianRupee}
            label="Total revenue"
            value={formatINR(stats?.totals?.revenue)}
            hint="Excludes cancelled orders"
          />
          <StatCard icon={ShoppingBag} label="Orders" value={stats?.totals?.orders || 0} hint="All time" />
          <StatCard icon={Users} label="Customers" value={stats?.totals?.customers || 0} hint="Registered shoppers" />
          <StatCard
            icon={AlertTriangle}
            label="Low stock"
            value={stats?.totals?.lowStock || 0}
            hint="Active sarees with 5 or fewer left"
          />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="card-warm p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl text-ink">Revenue, last 14 days</h2>
              <p className="text-xs text-bamboo-600">Daily order value in rupees</p>
            </div>
            <Badge tone="flame">₹ INR</Badge>
          </div>
          {chartData.length ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="kharnaRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F97316" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#FBBF24" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 6" stroke="#FDE68A" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#6B4A24' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#6B4A24' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => (value >= 1000 ? `${value / 1000}k` : value)}
                    width={44}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#EA580C"
                    strokeWidth={2.5}
                    fill="url(#kharnaRevenue)"
                    activeDot={{ r: 4, fill: '#EA580C' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="flex h-64 items-center justify-center text-sm text-bamboo-600">
              No orders yet — the first sale will light up this chart.
            </p>
          )}
        </section>

        <section className="card-warm p-5">
          <h2 className="font-display text-xl text-ink">Orders by status</h2>
          <p className="text-xs text-bamboo-600">Every order, all time</p>
          <div className="mt-5 space-y-4">
            {statusCounts.map((entry) => (
              <div key={entry.key}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-bamboo-800">{entry.label}</span>
                  <span className="font-medium text-ink">{entry.count}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sun-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sun-400 to-flame-600"
                    style={{ width: `${Math.round((entry.count / maxStatus) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card-warm overflow-hidden">
          <div className="flex items-center justify-between border-b border-sun-200/80 px-5 py-4">
            <h2 className="font-display text-xl text-ink">Recent orders</h2>
            <Link to="/admin/orders" className="text-xs font-medium text-flame-700 hover:text-sindoor-700">
              View all
            </Link>
          </div>
          {stats?.recentOrders?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-bamboo-600">
                    <th className="px-5 py-3 font-medium">Order</th>
                    <th className="px-3 py-3 font-medium">Customer</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order._id} className="border-t border-sun-100">
                      <td className="px-5 py-3">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="font-medium text-flame-700 hover:text-sindoor-700"
                        >
                          {order.orderNumber}
                        </Link>
                        <p className="text-xs text-bamboo-600">{formatDateTime(order.createdAt)}</p>
                      </td>
                      <td className="px-3 py-3 text-bamboo-800">{order.user?.name || 'Guest'}</td>
                      <td className="px-3 py-3">
                        <Badge tone={STATUS_TONE[order.status] || 'sun'}>
                          {ORDER_STATUS[order.status]?.label || order.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-ink">
                        {formatINR(order.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-bamboo-600">No orders yet.</p>
          )}
        </section>

        <section className="card-warm overflow-hidden">
          <div className="flex items-center justify-between border-b border-sun-200/80 px-5 py-4">
            <h2 className="font-display text-xl text-ink">Low stock</h2>
            <Link
              to="/admin/products"
              className="text-xs font-medium text-flame-700 hover:text-sindoor-700"
            >
              Manage sarees
            </Link>
          </div>
          {stats?.lowStock?.length ? (
            <ul className="divide-y divide-sun-100">
              {stats.lowStock.map((product) => (
                <li key={product._id} className="flex items-center gap-3 px-5 py-3">
                  <img
                    src={product.images?.[0]}
                    alt=""
                    className="h-12 w-10 rounded-lg object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{product.name}</p>
                    <p className="text-xs text-bamboo-600">{formatINR(product.price)}</p>
                  </div>
                  <Badge tone={product.stock === 0 ? 'neutral' : 'flame'}>
                    {product.stock === 0 ? 'Sold out' : `${product.stock} left`}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="flex items-center gap-2 px-5 py-10 text-sm text-bamboo-600">
              <Package className="h-4 w-4" aria-hidden="true" />
              Every active saree has healthy stock.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
