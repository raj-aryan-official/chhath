import { useCallback, useEffect, useState } from 'react';
import { Search, Users } from 'lucide-react';
import Seo from '../../components/seo/Seo.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { TableSkeleton } from '../../components/ui/Skeleton.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import { fetchAdminUsers } from '../../services/admin.service.js';
import { formatDate } from '../../utils/format.js';

export default function AdminUsers() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const query = useDebounce(search, 350);

  const load = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      const data = await fetchAdminUsers({ page, limit: 15, q: query || undefined });
      setRows(data.users);
      setMeta({ page: data.page, pages: data.pages, total: data.total });
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, [page, query]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  return (
    <div className="space-y-5">
      <Seo title="Customers" description="KHARNA customers" noIndex />

      <div>
        <p className="eyebrow">People</p>
        <h1 className="mt-1 font-display text-3xl text-ink">Customers</h1>
        <p className="mt-1 text-sm text-bamboo-700">
          {meta.total ? `${meta.total} registered customers` : 'No customers yet'}
        </p>
      </div>

      <div className="card-warm p-4">
        <div className="flex items-center gap-2 rounded-full border border-sun-300 bg-white px-4 py-2.5 sm:max-w-sm">
          <Search className="h-4 w-4 text-bamboo-600" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email or phone"
            className="w-full bg-transparent text-sm focus:outline-none"
            aria-label="Search customers"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      <div className="card-warm overflow-hidden">
        {status === 'loading' && !rows.length ? (
          <div className="p-5">
            <TableSkeleton rows={7} columns={4} />
          </div>
        ) : rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-sun-200 bg-sun-50/70 text-[11px] uppercase tracking-wider text-bamboo-600">
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-3 py-3 font-medium">Phone</th>
                  <th className="px-3 py-3 font-medium">Addresses</th>
                  <th className="px-5 py-3 text-right font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((user) => {
                  const primary = user.addresses?.find((address) => address.isDefault) || user.addresses?.[0];
                  return (
                    <tr key={user._id} className="border-b border-sun-100 last:border-0">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sun-100 font-display text-sm text-flame-700">
                            {user.name?.charAt(0)?.toUpperCase() || 'K'}
                          </span>
                          <div>
                            <p className="font-medium text-ink">{user.name}</p>
                            <p className="text-xs text-bamboo-600">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-bamboo-800">{user.phone || '—'}</td>
                      <td className="px-3 py-3 text-bamboo-800">
                        {user.addresses?.length || 0}
                        {primary && (
                          <p className="text-xs text-bamboo-600">
                            {primary.city}, {primary.state}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right text-bamboo-800">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              icon={Users}
              title="No customers found"
              description={
                query
                  ? 'No customer matches that search.'
                  : 'Customers will appear here once they create an account.'
              }
            />
          </div>
        )}
      </div>

      {meta.pages > 1 && <Pagination page={meta.page} pages={meta.pages} onChange={setPage} />}
    </div>
  );
}
