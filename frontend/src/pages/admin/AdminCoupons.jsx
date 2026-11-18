import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Plus, Ticket, Trash2 } from 'lucide-react';
import Seo from '../../components/seo/Seo.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Modal from '../../components/ui/Modal.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { createCoupon, deleteCoupon, fetchCoupons, updateCoupon } from '../../services/admin.service.js';
import { toast } from '../../store/index.js';
import { formatDate, formatINR } from '../../utils/format.js';

const schema = z.object({
  code: z.string().trim().min(3, 'Code is too short').max(30),
  description: z.string().trim().max(160).optional().or(z.literal('')),
  type: z.enum(['percent', 'fixed']),
  value: z.coerce.number().min(1, 'Value must be at least 1'),
  minOrder: z.coerce.number().min(0),
  maxDiscount: z.coerce.number().min(0),
  expiresAt: z.string().optional().or(z.literal('')),
  usageLimit: z.coerce.number().int().min(0),
  isActive: z.boolean(),
});

const EMPTY = {
  code: '',
  description: '',
  type: 'percent',
  value: 10,
  minOrder: 0,
  maxDiscount: 0,
  expiresAt: '',
  usageLimit: 0,
  isActive: true,
};

const toDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

function CouponForm({ coupon, onClose, onSaved }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: coupon
      ? {
          code: coupon.code,
          description: coupon.description || '',
          type: coupon.type,
          value: coupon.value,
          minOrder: coupon.minOrder || 0,
          maxDiscount: coupon.maxDiscount || 0,
          expiresAt: toDateInput(coupon.expiresAt),
          usageLimit: coupon.usageLimit || 0,
          isActive: Boolean(coupon.isActive),
        }
      : EMPTY,
  });
  const [error, setError] = useState('');
  const type = watch('type');

  const onSubmit = async (values) => {
    setError('');
    const payload = {
      code: values.code.toUpperCase(),
      description: values.description || '',
      type: values.type,
      value: Number(values.value),
      minOrder: Number(values.minOrder) || 0,
      maxDiscount: Number(values.maxDiscount) || 0,
      usageLimit: Number(values.usageLimit) || 0,
      isActive: values.isActive,
    };
    if (values.expiresAt) payload.expiresAt = values.expiresAt;

    try {
      if (coupon) {
        await updateCoupon(coupon._id, payload);
        toast.success('Coupon updated');
      } else {
        await createCoupon(payload);
        toast.success('Coupon created');
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className="label-base">Code</span>
          <input
            type="text"
            className="input-base uppercase"
            placeholder="CHHATH10"
            {...register('code')}
          />
          {errors.code && <p className="mt-1 text-xs text-red-700">{errors.code.message}</p>}
        </div>
        <div>
          <span className="label-base">Type</span>
          <select className="input-base" {...register('type')}>
            <option value="percent">Percent off</option>
            <option value="fixed">Flat rupees off</option>
          </select>
        </div>
      </div>

      <div>
        <span className="label-base">Description</span>
        <input
          type="text"
          className="input-base"
          placeholder="A small blessing for the festive week"
          {...register('description')}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-700">{errors.description.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className="label-base">{type === 'percent' ? 'Percent off' : 'Rupees off'}</span>
          <input type="number" min="1" className="input-base" {...register('value')} />
          {errors.value && <p className="mt-1 text-xs text-red-700">{errors.value.message}</p>}
        </div>
        <div>
          <span className="label-base">Minimum order (₹)</span>
          <input type="number" min="0" className="input-base" {...register('minOrder')} />
        </div>
        <div>
          <span className="label-base">Maximum discount (₹)</span>
          <input type="number" min="0" className="input-base" {...register('maxDiscount')} />
          <p className="mt-1 text-xs text-bamboo-600">0 means no cap</p>
        </div>
        <div>
          <span className="label-base">Usage limit</span>
          <input type="number" min="0" className="input-base" {...register('usageLimit')} />
          <p className="mt-1 text-xs text-bamboo-600">0 means unlimited</p>
        </div>
        <div>
          <span className="label-base">Expires on</span>
          <input type="date" className="input-base" {...register('expiresAt')} />
        </div>
        <label className="flex items-end gap-2 pb-2.5 text-sm text-bamboo-800">
          <input type="checkbox" className="h-4 w-4 accent-flame-600" {...register('isActive')} />
          Active
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" type="submit" loading={isSubmitting}>
          {coupon ? 'Save coupon' : 'Create coupon'}
        </Button>
      </div>
    </form>
  );
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      setCoupons(await fetchCoupons());
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await deleteCoupon(deleting._id);
      toast.success('Coupon deleted');
      setDeleting(null);
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <Seo title="Coupons" description="Manage KHARNA coupons" noIndex />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Offerings</p>
          <h1 className="mt-1 font-display text-3xl text-ink">Coupons</h1>
          <p className="mt-1 text-sm text-bamboo-700">
            Small, honest savings — never attached to sacred offerings.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New coupon
        </Button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      {status === 'loading' && !coupons.length ? (
        <div className="space-y-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-20" />
          ))}
        </div>
      ) : coupons.length ? (
        <div className="card-warm overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-sun-200 bg-sun-50/70 text-[11px] uppercase tracking-wider text-bamboo-600">
                <th className="px-5 py-3 font-medium">Code</th>
                <th className="px-3 py-3 font-medium">Offer</th>
                <th className="px-3 py-3 font-medium">Minimum order</th>
                <th className="px-3 py-3 font-medium">Usage</th>
                <th className="px-3 py-3 font-medium">Expiry</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => {
                const expired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
                const maxed =
                  coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit;
                return (
                  <tr key={coupon._id} className="border-b border-sun-100 last:border-0">
                    <td className="px-5 py-3">
                      <p className="font-mono text-sm font-semibold tracking-wide text-ink">
                        {coupon.code}
                      </p>
                      {coupon.description && (
                        <p className="max-w-[220px] truncate text-xs text-bamboo-600">
                          {coupon.description}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-3 text-bamboo-800">
                      {coupon.type === 'percent'
                        ? `${coupon.value}% off`
                        : `${formatINR(coupon.value)} off`}
                      {coupon.maxDiscount > 0 && (
                        <p className="text-xs text-bamboo-600">
                          capped at {formatINR(coupon.maxDiscount)}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-3 text-bamboo-800">
                      {coupon.minOrder > 0 ? formatINR(coupon.minOrder) : 'None'}
                    </td>
                    <td className="px-3 py-3 text-bamboo-800">
                      {coupon.usedCount}
                      {coupon.usageLimit > 0 ? ` / ${coupon.usageLimit}` : ' / ∞'}
                    </td>
                    <td className="px-3 py-3 text-bamboo-800">
                      {coupon.expiresAt ? formatDate(coupon.expiresAt) : 'No expiry'}
                    </td>
                    <td className="px-3 py-3">
                      {!coupon.isActive ? (
                        <Badge tone="neutral">Paused</Badge>
                      ) : expired ? (
                        <Badge tone="neutral">Expired</Badge>
                      ) : maxed ? (
                        <Badge tone="neutral">Used up</Badge>
                      ) : (
                        <Badge tone="success">Live</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(coupon);
                            setFormOpen(true);
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-bamboo-700 transition hover:bg-sun-100 hover:text-sindoor-700"
                          aria-label={`Edit ${coupon.code}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(coupon)}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-sindoor-700 transition hover:bg-red-50"
                          aria-label={`Delete ${coupon.code}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={Ticket}
          title="No coupons yet"
          description="Create a quiet, honest saving for the festive week. Keep faith out of the discount."
          action={
            <Button
              size="sm"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              Create a coupon
            </Button>
          }
        />
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit coupon' : 'New coupon'}
        size="lg"
      >
        {formOpen && (
          <CouponForm
            coupon={editing}
            onClose={() => setFormOpen(false)}
            onSaved={() => {
              setFormOpen(false);
              setEditing(null);
              load();
            }}
          />
        )}
      </Modal>

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete this coupon?"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setDeleting(null)}>
              Keep it
            </Button>
            <Button variant="danger" size="sm" onClick={confirmDelete} loading={busy}>
              Delete coupon
            </Button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-bamboo-700">
          <span className="font-mono font-semibold text-ink">{deleting?.code}</span> will stop
          working immediately. Past orders are not affected.
        </p>
      </Modal>
    </div>
  );
}
