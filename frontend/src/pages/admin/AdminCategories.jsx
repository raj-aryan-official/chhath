import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import Seo from '../../components/seo/Seo.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Modal from '../../components/ui/Modal.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { fetchCategories } from '../../services/catalog.service.js';
import { createCategory, deleteCategory, updateCategory } from '../../services/admin.service.js';
import { toast } from '../../store/index.js';

const schema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(80),
  tagline: z.string().trim().max(140).optional().or(z.literal('')),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  image: z.string().trim().max(500).optional().or(z.literal('')),
  order: z.coerce.number().int().min(0),
});

const EMPTY = { name: '', tagline: '', description: '', image: '', order: 0 };

function CategoryForm({ category, onClose, onSaved }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: category
      ? {
          name: category.name,
          tagline: category.tagline || '',
          description: category.description || '',
          image: category.image || '',
          order: category.order || 0,
        }
      : EMPTY,
  });
  const [error, setError] = useState('');

  const onSubmit = async (values) => {
    setError('');
    const payload = {
      name: values.name,
      tagline: values.tagline || '',
      description: values.description || '',
      image: values.image || '',
      order: Number(values.order) || 0,
    };
    try {
      if (category) {
        await updateCategory(category._id, payload);
        toast.success('Collection updated');
      } else {
        await createCategory(payload);
        toast.success('Collection created');
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

      <div>
        <span className="label-base">Name</span>
        <input
          type="text"
          className="input-base"
          placeholder="Tussar Silk"
          {...register('name')}
        />
        {errors.name && <p className="mt-1 text-xs text-red-700">{errors.name.message}</p>}
      </div>

      <div>
        <span className="label-base">Tagline</span>
        <input
          type="text"
          className="input-base"
          placeholder="Earthy gold with a natural slub"
          {...register('tagline')}
        />
        {errors.tagline && <p className="mt-1 text-xs text-red-700">{errors.tagline.message}</p>}
      </div>

      <div>
        <span className="label-base">Description</span>
        <textarea rows={3} className="input-base" {...register('description')} />
        {errors.description && (
          <p className="mt-1 text-xs text-red-700">{errors.description.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-[1.6fr_1fr]">
        <div>
          <span className="label-base">Image URL</span>
          <input
            type="text"
            className="input-base"
            placeholder="https://… or /uploads/…"
            {...register('image')}
          />
          {errors.image && <p className="mt-1 text-xs text-red-700">{errors.image.message}</p>}
        </div>
        <div>
          <span className="label-base">Display order</span>
          <input type="number" min="0" className="input-base" {...register('order')} />
          {errors.order && <p className="mt-1 text-xs text-red-700">{errors.order.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" type="submit" loading={isSubmitting}>
          {category ? 'Save changes' : 'Create collection'}
        </Button>
      </div>
    </form>
  );
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
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
      setCategories(await fetchCategories());
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setFormOpen(true);
  };

  const afterSave = () => {
    setFormOpen(false);
    setEditing(null);
    load();
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await deleteCategory(deleting._id);
      toast.success('Collection removed');
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
      <Seo title="Collections" description="Manage KHARNA collections" noIndex />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Catalogue</p>
          <h1 className="mt-1 font-display text-3xl text-ink">Collections</h1>
          <p className="mt-1 text-sm text-bamboo-700">
            The fabrics and moods that organise the shop.
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          New collection
        </Button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      {status === 'loading' && !categories.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-56" />
          ))}
        </div>
      ) : categories.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <article key={category._id} className="card-warm overflow-hidden">
              <div className="flex items-center gap-3 border-b border-sun-200/70 p-4">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-sun-100">
                  {category.image ? (
                    <img src={category.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-flame-600">
                      <Tags className="h-5 w-5" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-display text-lg text-ink">{category.name}</p>
                  <p className="truncate text-xs text-bamboo-600">
                    /{category.slug} · order {category.order}
                  </p>
                </div>
              </div>

              <div className="space-y-3 p-4">
                <p className="line-clamp-2 min-h-[2.5rem] text-sm text-bamboo-700">
                  {category.tagline || category.description || 'No tagline yet.'}
                </p>
                <div className="flex items-center justify-between">
                  <Badge tone={category.productCount ? 'sun' : 'neutral'}>
                    {category.productCount || 0} active sarees
                  </Badge>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(category)}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-bamboo-700 transition hover:bg-sun-100 hover:text-sindoor-700"
                      aria-label={`Edit ${category.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(category)}
                      disabled={Boolean(category.productCount)}
                      title={
                        category.productCount
                          ? 'Move its sarees to another collection first'
                          : 'Delete collection'
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-full text-sindoor-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label={`Delete ${category.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Tags}
          title="No collections yet"
          description="Collections give the shop its shape — by fabric, by mood, by day of Chhath."
          action={
            <Button size="sm" onClick={openCreate}>
              Create the first collection
            </Button>
          }
        />
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit collection' : 'New collection'}
        size="lg"
      >
        {formOpen && (
          <CategoryForm
            category={editing}
            onClose={() => setFormOpen(false)}
            onSaved={afterSave}
          />
        )}
      </Modal>

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete this collection?"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setDeleting(null)}>
              Keep it
            </Button>
            <Button variant="danger" size="sm" onClick={confirmDelete} loading={busy}>
              Delete collection
            </Button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-bamboo-700">
          <span className="font-medium text-ink">{deleting?.name}</span> will be removed. This only
          works when the collection has no active sarees.
        </p>
      </Modal>
    </div>
  );
}
