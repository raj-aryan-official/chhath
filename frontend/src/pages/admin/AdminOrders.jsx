import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Package, Search } from 'lucide-react';
import Seo from '../../components/seo/Seo.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { TableSkeleton } from '../../components/ui/Skeleton.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import { fetchAdminOrders } from '../../services/admin.service.js';
import { formatDateTime, formatINR, cx } from '../../utils/format.js';
import { ORDER_STATUS } from '../../utils/constants.js';

const STATUS_TONE = {
  placed: 'sun',
  confirmed: 'flame',
  packed: 'flame',
  shipped: 'sun',
  delivered: 'success',
  cancelled: 'neutral',
};

const FILTERS = [
  { value: '', label: 'All orders' },
  ...Object.entries(ORDER_STATUS).map(([value, meta]) => ({ value, label: meta.label })),
];

export default function AdminOrders() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const query = useDebounce(search, 350);

  const load = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      const data = await fetchAdminOrders({
        page,
        limit: 15,
        status: statusFilter || undefined,
        q: query || undefined,
      });
      setRows(data.orders);
      setMeta({ page: data.page, pages: data.pages, total: data.total });
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, [page, query, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter]);

  return (
    <div className="space-y-5">
      <Seo title="Orders" description="Manage KHARNA orders" noIndex />

      <div>
        <p className="eyebrow">Fulfilment</p>
        <h1 className="mt-1 font-display text-3xl text-ink">Orders</h1>
        <p className="mt-1 text-sm text-bamboo-700">
          {meta.total ? `${meta.total} orders recorded` : 'No orders yet'}
        </p>
      </div>

      <div className="card-warm flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-sun-300 bg-white px-4 py-2.5">
          <Search className="h-4 w-4 text-bamboo-600" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by order number"
            className="w-full bg-transparent text-sm focus:outline-none"
            aria-label="Search orders"
          />
        </div>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
          {FILTERS.map((filter) => (
            <button
              key={filter.value || 'all'}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              aria-pressed={statusFilter === filter.value}
              className={cx(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                statusFilter === filter.value
                  ? 'border-flame-600 bg-flame-600 text-white'
                  : 'border-sun-300 bg-white text-bamboo-800 hover:border-flame-400'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      <div className="card-warm overflow-hidden">
        {status === 'loading' && !rows.length ? (
          <div className="p-5">
            <TableSkeleton rows={7} columns={6} />
          </div>
        ) : rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-sun-200 bg-sun-50/70 text-[11px] uppercase tracking-wider text-bamboo-600">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-3 py-3 font-medium">Customer</th>
                  <th className="px-3 py-3 font-medium">Items</th>
                  <th className="px-3 py-3 font-medium">Payment</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 text-right font-medium">Total</th>
                  <th className="px-5 py-3 text-right font-medium">View</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((order) => (
                  <tr key={order._id} className="border-b border-sun-100 last:border-0">
                    <td className="px-5 py-3">
                      <p className="font-medium text-ink">{order.orderNumber}</p>
                      <p className="text-xs text-bamboo-600">{formatDateTime(order.createdAt)}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-bamboo-800">{order.user?.name || 'Guest'}</p>
                      <p className="text-xs text-bamboo-600">
                        {order.shippingAddress?.city}, {order.shippingAddress?.pincode}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-bamboo-800">
                      {order.items.reduce((sum, item) => sum + item.qty, 0)}
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-xs uppercase tracking-wide text-bamboo-600">
                        {order.paymentMethod}
                      </p>
                      <p
                        className={cx(
                          'text-xs font-medium',
                          order.paymentStatus === 'paid'
                            ? 'text-emerald-700'
                            : order.paymentStatus === 'refunded'
                              ? 'text-stone-600'
                              : 'text-flame-700'
                        )}
                      >
                        {order.paymentStatus}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={STATUS_TONE[order.status] || 'sun'}>
                        {ORDER_STATUS[order.status]?.label || order.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-right font-medium text-ink">
                      {formatINR(order.total)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-bamboo-700 transition hover:bg-sun-100 hover:text-sindoor-700"
                          aria-label={`Open order ${order.orderNumber}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              icon={Package}
              title="No orders here"
              description={
                statusFilter || query
                  ? 'Nothing matches this filter yet. Try another status or clear the search.'
                  : 'As soon as a devotee places an order, it will appear here.'
              }
            />
          </div>
        )}
      </div>

      {meta.pages > 1 && <Pagination page={meta.page} pages={meta.pages} onChange={setPage} />}
    </div>
  );
}
