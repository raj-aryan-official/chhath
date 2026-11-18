import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import Seo from '../../components/seo/Seo.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { TableSkeleton } from '../../components/ui/Skeleton.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import { deleteProduct, fetchAdminProducts } from '../../services/admin.service.js';
import { formatINR } from '../../utils/format.js';

export default function AdminProducts() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const query = useDebounce(search, 350);

  const load = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      const data = await fetchAdminProducts({ page, limit: 12, q: query || undefined });
      setRows(data.products);
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

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await deleteProduct(deleting._id);
      setDeleting(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <Seo title="Sarees" description="Manage the KHARNA catalogue" noIndex />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Catalogue</p>
          <h1 className="mt-1 font-display text-3xl text-ink">Sarees</h1>
          <p className="mt-1 text-sm text-bamboo-700">
            {meta.total ? `${meta.total} sarees in the store` : 'Add your first saree'}
          </p>
        </div>
        <Button to="/admin/products/new" size="sm">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add saree
        </Button>
      </div>

      <div className="card-warm p-4">
        <label htmlFor="admin-product-search" className="sr-only">
          Search sarees
        </label>
        <div className="flex items-center gap-2 rounded-full border border-sun-300 bg-white px-4 py-2.5 sm:max-w-sm">
          <Search className="h-4 w-4 text-bamboo-600" aria-hidden="true" />
          <input
            id="admin-product-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or slug"
            className="w-full bg-transparent text-sm text-ink placeholder:text-bamboo-600/60 focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      <div className="card-warm overflow-hidden">
        {status === 'loading' && !rows.length ? (
          <div className="p-5">
            <TableSkeleton rows={6} columns={5} />
          </div>
        ) : rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-sun-200 bg-sun-50/70 text-[11px] uppercase tracking-wider text-bamboo-600">
                  <th className="px-5 py-3 font-medium">Saree</th>
                  <th className="px-3 py-3 font-medium">Collection</th>
                  <th className="px-3 py-3 font-medium">Price</th>
                  <th className="px-3 py-3 font-medium">Stock</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((product) => (
                  <tr key={product._id} className="border-b border-sun-100 last:border-0">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt=""
                            className="h-14 w-11 rounded-lg object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <span className="h-14 w-11 rounded-lg bg-sun-100" aria-hidden="true" />
                        )}
                        <div className="min-w-0">
                          <p className="max-w-[240px] truncate font-medium text-ink">{product.name}</p>
                          <p className="truncate text-xs text-bamboo-600">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-bamboo-800">
                      {product.category?.name || '—'}
                      <p className="text-xs text-bamboo-600">{product.fabric}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-ink">{formatINR(product.price)}</p>
                      {product.mrp > product.price && (
                        <p className="text-xs text-bamboo-600 line-through">{formatINR(product.mrp)}</p>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={
                          product.stock === 0
                            ? 'font-medium text-sindoor-700'
                            : product.stock <= 5
                              ? 'font-medium text-flame-700'
                              : 'text-bamboo-800'
                        }
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        <Badge tone={product.isActive ? 'success' : 'neutral'}>
                          {product.isActive ? 'Live' : 'Hidden'}
                        </Badge>
                        {product.isFeatured && <Badge tone="flame">Featured</Badge>}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/product/${product.slug}`}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-bamboo-700 transition hover:bg-sun-100 hover:text-sindoor-700"
                          aria-label={`View ${product.name} on the storefront`}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/admin/products/${product.slug}/edit`}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-bamboo-700 transition hover:bg-sun-100 hover:text-sindoor-700"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleting(product)}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-sindoor-700 transition hover:bg-red-50"
                          aria-label={`Remove ${product.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
              icon={Plus}
              title="No sarees found"
              description={
                query
                  ? 'No saree matches that search. Try a different name or slug.'
                  : 'The catalogue is empty. Add your first saree to open the store.'
              }
              action={
                query ? (
                  <Button variant="secondary" size="sm" onClick={() => setSearch('')}>
                    Clear search
                  </Button>
                ) : (
                  <Button to="/admin/products/new" size="sm">
                    Add saree
                  </Button>
                )
              }
            />
          </div>
        )}
      </div>

      {meta.pages > 1 && (
        <Pagination page={meta.page} pages={meta.pages} onChange={setPage} />
      )}

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Remove this saree?"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setDeleting(null)}>
              Keep it
            </Button>
            <Button variant="danger" size="sm" onClick={confirmDelete} loading={busy}>
              Remove from store
            </Button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-bamboo-700">
          <span className="font-medium text-ink">{deleting?.name}</span> will be hidden from the
          storefront. Existing orders keep their snapshot, so nothing is lost.
        </p>
      </Modal>
    </div>
  );
}
