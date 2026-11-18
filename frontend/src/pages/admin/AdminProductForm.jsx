import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ImagePlus, Loader2, Plus, Trash2, Upload } from 'lucide-react';
import Seo from '../../components/seo/Seo.jsx';
import Button from '../../components/ui/Button.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import {
  createProduct,
  updateProduct,
  uploadImages,
} from '../../services/admin.service.js';
import { fetchCategories, fetchProductBySlug } from '../../services/catalog.service.js';
import { toast } from '../../store/index.js';
import { CHHATH_DAYS, COLORS, FABRICS } from '../../utils/constants.js';
import { cx } from '../../utils/format.js';

const DAYS = [...CHHATH_DAYS.map((day) => day.name), 'All Days'];

const schema = z
  .object({
    name: z.string().trim().min(3, 'Name is too short').max(140),
    shortDescription: z.string().trim().max(220).optional().or(z.literal('')),
    description: z.string().trim().min(20, 'Write at least 20 characters').max(4000),
    category: z.string().min(1, 'Choose a collection'),
    fabric: z.string().min(1, 'Choose a fabric'),
    day: z.string().min(1),
    colorName: z.string().min(1),
    colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a hex colour like #F5C518'),
    price: z.coerce.number().min(1, 'Price must be greater than zero'),
    mrp: z.coerce.number().min(1, 'MRP must be greater than zero'),
    stock: z.coerce.number().int().min(0),
    images: z.array(z.string().min(1)).min(1, 'Add at least one image').max(8, 'Up to 8 images'),
    sizes: z
      .array(
        z.object({
          label: z.string().trim().min(1, 'Size label is required').max(60),
          priceDelta: z.coerce.number().min(0),
        })
      )
      .min(1)
      .max(5),
    blouseIncluded: z.boolean(),
    blouseDetails: z.string().trim().max(200).optional().or(z.literal('')),
    care: z.string().trim().max(300).optional().or(z.literal('')),
    tags: z.string().trim().max(300).optional().or(z.literal('')),
    isFeatured: z.boolean(),
    isActive: z.boolean(),
  })
  .refine((data) => data.mrp >= data.price, {
    message: 'MRP must be at least the selling price',
    path: ['mrp'],
  });

const DEFAULT_VALUES = {
  name: '',
  shortDescription: '',
  description: '',
  category: '',
  fabric: FABRICS[0].name,
  day: 'All Days',
  colorName: COLORS[0].name,
  colorHex: COLORS[0].hex,
  price: '',
  mrp: '',
  stock: '',
  images: [],
  sizes: [
    { label: 'Free Size', priceDelta: 0 },
    { label: 'Free Size + Stitched Blouse', priceDelta: 499 },
  ],
  blouseIncluded: true,
  blouseDetails: '',
  care: '',
  tags: '',
  isFeatured: false,
  isActive: true,
};

function Field({ label, error, hint, children, className }) {
  return (
    <div className={className}>
      <span className="label-base">{label}</span>
      {children}
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
      {!error && hint && <p className="mt-1 text-xs text-bamboo-600">{hint}</p>}
    </div>
  );
}

export default function AdminProductForm() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(slug);

  const [categories, setCategories] = useState([]);
  const [productId, setProductId] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: DEFAULT_VALUES });

  const { fields, append, remove } = useFieldArray({ control, name: 'sizes' });
  const images = watch('images');
  const colorName = watch('colorName');

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((error) => setLoadError(error.message));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    fetchProductBySlug(slug)
      .then((product) => {
        if (!active) return;
        setProductId(product._id);
        reset({
          name: product.name,
          shortDescription: product.shortDescription || '',
          description: product.description || '',
          category: product.category?._id || product.category,
          fabric: product.fabric,
          day: product.day || 'All Days',
          colorName: product.color?.name || COLORS[0].name,
          colorHex: product.color?.hex || COLORS[0].hex,
          price: product.price,
          mrp: product.mrp,
          stock: product.stock,
          images: product.images || [],
          sizes:
            product.sizes?.length > 0
              ? product.sizes.map((size) => ({ label: size.label, priceDelta: size.priceDelta }))
              : DEFAULT_VALUES.sizes,
          blouseIncluded: product.blouse?.included ?? true,
          blouseDetails: product.blouse?.details || '',
          care: product.care || '',
          tags: (product.tags || []).join(', '),
          isFeatured: Boolean(product.isFeatured),
          isActive: Boolean(product.isActive),
        });
        setLoading(false);
      })
      .catch((error) => {
        if (!active) return;
        setLoadError(error.message);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isEdit, slug, reset]);

  const addImage = () => {
    const url = imageUrl.trim();
    if (!url) return;
    if (images.length >= 8) {
      toast.error('Up to 8 images per saree');
      return;
    }
    if (!/^https?:\/\/|^\//.test(url)) {
      toast.error('Use a full image URL or an uploaded path');
      return;
    }
    setValue('images', [...images, url], { shouldValidate: true });
    setImageUrl('');
  };

  const removeImage = (index) => {
    setValue(
      'images',
      images.filter((_, itemIndex) => itemIndex !== index),
      { shouldValidate: true }
    );
  };

  const handleFiles = async (event) => {
    const files = event.target.files;
    if (!files?.length) return;
    const room = 8 - images.length;
    if (room <= 0) {
      toast.error('Up to 8 images per saree');
      return;
    }
    setUploading(true);
    try {
      const urls = await uploadImages(Array.from(files).slice(0, room));
      setValue('images', [...images, ...urls].slice(0, 8), { shouldValidate: true });
      toast.success(`${urls.length} image${urls.length === 1 ? '' : 's'} uploaded`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (values) => {
    setSubmitError('');
    const payload = {
      name: values.name,
      description: values.description,
      category: values.category,
      fabric: values.fabric,
      day: values.day,
      color: { name: values.colorName, hex: values.colorHex },
      price: Number(values.price),
      mrp: Number(values.mrp),
      stock: Number(values.stock),
      images: values.images,
      sizes: values.sizes.map((size) => ({
        label: size.label,
        priceDelta: Number(size.priceDelta) || 0,
      })),
      blouse: { included: values.blouseIncluded, details: values.blouseDetails || '' },
      care: values.care || '',
      tags: values.tags
        ? values.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : [],
      isFeatured: values.isFeatured,
      isActive: values.isActive,
    };
    if (values.shortDescription) payload.shortDescription = values.shortDescription;

    try {
      if (isEdit) {
        await updateProduct(productId, payload);
        toast.success('Saree updated');
      } else {
        await createProduct(payload);
        toast.success('Saree added to the catalogue');
      }
      navigate('/admin/products');
    } catch (error) {
      setSubmitError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
          <Skeleton className="h-[520px]" />
          <Skeleton className="h-[520px]" />
        </div>
      </div>
    );
  }

  if (loadError && !categories.length) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
        {loadError}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Seo
        title={isEdit ? 'Edit saree' : 'Add saree'}
        description="Manage the KHARNA catalogue"
        noIndex
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-bamboo-600 transition hover:text-sindoor-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to sarees
          </Link>
          <h1 className="mt-1 font-display text-3xl text-ink">
            {isEdit ? 'Edit saree' : 'Add a saree'}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" to="/admin/products">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Add saree'}
          </Button>
        </div>
      </div>

      {submitError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <section className="card-warm space-y-4 p-5">
            <h2 className="font-display text-xl text-ink">The saree</h2>

            <Field label="Name" error={errors.name?.message}>
              <input
                type="text"
                className="input-base"
                placeholder="Saffron Tussar with Zari Border"
                {...register('name')}
              />
            </Field>

            <Field
              label="Short line"
              error={errors.shortDescription?.message}
              hint="Shown on cards and in search results"
            >
              <input
                type="text"
                className="input-base"
                placeholder="Pure tussar woven for the evening arghya"
                {...register('shortDescription')}
              />
            </Field>

            <Field
              label="Description"
              error={errors.description?.message}
              hint="Fabric, weave, drape and how it feels at the ghat. At least 20 characters."
            >
              <textarea rows={6} className="input-base" {...register('description')} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Collection" error={errors.category?.message}>
                <select className="input-base" {...register('category')}>
                  <option value="">Choose a collection</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Fabric" error={errors.fabric?.message}>
                <select className="input-base" {...register('fabric')}>
                  {FABRICS.map((fabric) => (
                    <option key={fabric.name} value={fabric.name}>
                      {fabric.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Chhath day" error={errors.day?.message}>
                <select className="input-base" {...register('day')}>
                  {DAYS.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Colour" error={errors.colorName?.message}>
                <select
                  className="input-base"
                  {...register('colorName', {
                    onChange: (event) => {
                      const chosen = COLORS.find((color) => color.name === event.target.value);
                      if (chosen) setValue('colorHex', chosen.hex, { shouldValidate: true });
                    },
                  })}
                >
                  {COLORS.map((color) => (
                    <option key={color.name} value={color.name}>
                      {color.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Selling price (₹)" error={errors.price?.message}>
                <input type="number" min="1" className="input-base" {...register('price')} />
              </Field>
              <Field label="MRP (₹)" error={errors.mrp?.message}>
                <input type="number" min="1" className="input-base" {...register('mrp')} />
              </Field>
              <Field label="Stock" error={errors.stock?.message}>
                <input type="number" min="0" className="input-base" {...register('stock')} />
              </Field>
            </div>

            <div className="flex flex-wrap gap-5 pt-1">
              <label className="flex items-center gap-2 text-sm text-bamboo-800">
                <input type="checkbox" className="h-4 w-4 accent-flame-600" {...register('isFeatured')} />
                Feature on the home page
              </label>
              <label className="flex items-center gap-2 text-sm text-bamboo-800">
                <input type="checkbox" className="h-4 w-4 accent-flame-600" {...register('isActive')} />
                Visible in the storefront
              </label>
            </div>
          </section>

          <section className="card-warm space-y-4 p-5">
            <div>
              <h2 className="font-display text-xl text-ink">Images</h2>
              <p className="text-xs text-bamboo-600">
                The first image is the cover. Up to 8 images, JPG/PNG/WebP/AVIF under 5 MB each.
              </p>
            </div>

            {errors.images?.message && <p className="text-xs text-red-700">{errors.images.message}</p>}

            {images.length > 0 && (
              <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {images.map((url, index) => (
                  <li key={`${url}-${index}`} className="group relative">
                    <img
                      src={url}
                      alt=""
                      className="aspect-[3/4] w-full rounded-xl border border-sun-200 object-cover"
                    />
                    {index === 0 && (
                      <span className="absolute left-1.5 top-1.5 rounded-full bg-ink/80 px-2 py-0.5 text-[10px] font-medium text-cream">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-ink/75 text-cream transition hover:bg-red-700"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex flex-1 items-center gap-2 rounded-full border border-sun-300 bg-white px-4 py-2.5">
                <ImagePlus className="h-4 w-4 shrink-0 text-bamboo-600" aria-hidden="true" />
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      addImage();
                    }
                  }}
                  placeholder="https://… or /uploads/…"
                  className="w-full bg-transparent text-sm focus:outline-none"
                  aria-label="Image URL"
                />
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={addImage}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add URL
              </Button>
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                className="sr-only"
                id="product-images"
                onChange={handleFiles}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Upload className="h-4 w-4" aria-hidden="true" />
                )}
                {uploading ? 'Uploading…' : 'Upload from device'}
              </Button>
              <p className="mt-1.5 text-xs text-bamboo-600">
                Local uploads are stored on the server; add Cloudinary keys for production.
              </p>
            </div>
          </section>

          <section className="card-warm space-y-4 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl text-ink">Sizes</h2>
                <p className="text-xs text-bamboo-600">
                  Up to five options. The price difference is added to the base price.
                </p>
              </div>
              {fields.length < 5 && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => append({ label: '', priceDelta: 0 })}
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  Add size
                </Button>
              )}
            </div>

            {errors.sizes?.message && <p className="text-xs text-red-700">{errors.sizes.message}</p>}

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      className="input-base"
                      placeholder="Free Size + Stitched Blouse"
                      aria-label={`Size ${index + 1} label`}
                      {...register(`sizes.${index}.label`)}
                    />
                    {errors.sizes?.[index]?.label && (
                      <p className="mt-1 text-xs text-red-700">
                        {errors.sizes[index].label.message}
                      </p>
                    )}
                  </div>
                  <div className="w-28">
                    <input
                      type="number"
                      min="0"
                      className="input-base"
                      placeholder="+₹"
                      aria-label={`Size ${index + 1} price difference`}
                      {...register(`sizes.${index}.priceDelta`)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="mt-1 flex h-9 w-9 items-center justify-center rounded-full text-sindoor-700 transition hover:bg-red-50 disabled:opacity-30"
                    aria-label={`Remove size ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="card-warm space-y-4 p-5">
            <h2 className="font-display text-xl text-ink">Care &amp; details</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Colour hex" error={errors.colorHex?.message}>
                <div className="flex items-center gap-2">
                  <span
                    className="h-10 w-10 shrink-0 rounded-xl border border-sun-300"
                    style={{ backgroundColor: watch('colorHex') }}
                    aria-hidden="true"
                  />
                  <input type="text" className="input-base" {...register('colorHex')} />
                </div>
              </Field>

              <Field label="Care" error={errors.care?.message} hint="e.g. Dry clean only">
                <input type="text" className="input-base" {...register('care')} />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Blouse details" error={errors.blouseDetails?.message}>
                <input
                  type="text"
                  className="input-base"
                  placeholder="Unstitched blouse piece, 0.8 m"
                  {...register('blouseDetails')}
                />
              </Field>
              <Field
                label="Tags"
                error={errors.tags?.message}
                hint="Comma separated, e.g. handloom, zari, festive"
              >
                <input type="text" className="input-base" {...register('tags')} />
              </Field>
            </div>

            <label className="flex items-center gap-2 text-sm text-bamboo-800">
              <input
                type="checkbox"
                className="h-4 w-4 accent-flame-600"
                {...register('blouseIncluded')}
              />
              Blouse piece included
            </label>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="card-warm p-5">
            <h2 className="font-display text-xl text-ink">Preview</h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-sun-200 bg-white">
              <div className="aspect-[3/4] w-full bg-sun-100">
                {images[0] ? (
                  <img src={images[0]} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-bamboo-600">
                    Cover image appears here
                  </div>
                )}
              </div>
              <div className="space-y-1 p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-flame-700">
                  {watch('fabric')} · {colorName}
                </p>
                <p className="font-display text-lg text-ink">
                  {watch('name') || 'Your saree name'}
                </p>
                <p className="text-sm font-medium text-flame-700">
                  ₹{Number(watch('price')) || 0}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-bamboo-600">
              Write about the weave and the moment, not a discount. Faith is never a gimmick.
            </p>
          </section>

          <section className="card-warm space-y-3 p-5">
            <h2 className="font-display text-lg text-ink">Before you publish</h2>
            <ul className="space-y-2 text-xs leading-relaxed text-bamboo-700">
              <li className={cx('flex gap-2', !errors.name && watch('name').trim().length > 2 && 'text-emerald-800')}>
                <span aria-hidden="true">•</span> A clear, honest name
              </li>
              <li className={cx('flex gap-2', images.length > 0 && 'text-emerald-800')}>
                <span aria-hidden="true">•</span> A real photo of the saree
              </li>
              <li className={cx('flex gap-2', !errors.price && watch('price') && 'text-emerald-800')}>
                <span aria-hidden="true">•</span> Price and MRP set fairly
              </li>
              <li className={cx('flex gap-2', watch('stock') !== '' && 'text-emerald-800')}>
                <span aria-hidden="true">•</span> Stock counted
              </li>
            </ul>
          </section>
        </aside>
      </form>
    </div>
  );
}
