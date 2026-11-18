import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard, Info, Save } from 'lucide-react';
import Seo from '../../components/seo/Seo.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { loadSettings, setSettings } from '../../store/slices/settingsSlice.js';
import { updateSettings } from '../../services/admin.service.js';
import { toast } from '../../store/index.js';

const schema = z.object({
  heroHeadline: z.string().trim().min(4, 'Headline is too short').max(120),
  heroSubline: z.string().trim().min(10, 'Subline is too short').max(300),
  announcement: z.string().trim().max(160),
  chhathDate: z.string().min(1, 'Choose this year’s Chhath date'),
  freeShippingThreshold: z.coerce.number().min(0),
  shippingFee: z.coerce.number().min(0),
  phone: z.string().trim().max(20).optional().or(z.literal('')),
  email: z.string().trim().email('Enter a valid email').or(z.literal('')),
  address: z.string().trim().max(300).optional().or(z.literal('')),
});

const toDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

export default function AdminSettings() {
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.settings.settings);
  const payments = useSelector((state) => state.settings.payments);
  const status = useSelector((state) => state.settings.status);

  const [saveError, setSaveError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      heroHeadline: '',
      heroSubline: '',
      announcement: '',
      chhathDate: '',
      freeShippingThreshold: 1999,
      shippingFee: 79,
      phone: '',
      email: '',
      address: '',
    },
  });

  useEffect(() => {
    dispatch(loadSettings());
  }, [dispatch]);

  useEffect(() => {
    if (!settings) return;
    reset({
      heroHeadline: settings.heroHeadline || '',
      heroSubline: settings.heroSubline || '',
      announcement: settings.announcement || '',
      chhathDate: toDateInput(settings.chhathDate),
      freeShippingThreshold: settings.freeShippingThreshold ?? 1999,
      shippingFee: settings.shippingFee ?? 79,
      phone: settings.contact?.phone || '',
      email: settings.contact?.email || '',
      address: settings.contact?.address || '',
    });
  }, [settings, reset]);

  const onSubmit = async (values) => {
    setSaveError('');
    try {
      const updated = await updateSettings({
        heroHeadline: values.heroHeadline,
        heroSubline: values.heroSubline,
        announcement: values.announcement,
        chhathDate: values.chhathDate,
        freeShippingThreshold: Number(values.freeShippingThreshold),
        shippingFee: Number(values.shippingFee),
        contact: {
          phone: values.phone || '',
          email: values.email || '',
          address: values.address || '',
        },
      });
      dispatch(setSettings(updated));
      reset({
        heroHeadline: updated.heroHeadline,
        heroSubline: updated.heroSubline,
        announcement: updated.announcement,
        chhathDate: toDateInput(updated.chhathDate),
        freeShippingThreshold: updated.freeShippingThreshold,
        shippingFee: updated.shippingFee,
        phone: updated.contact?.phone || '',
        email: updated.contact?.email || '',
        address: updated.contact?.address || '',
      });
      toast.success('Store settings saved');
    } catch (error) {
      setSaveError(error.message);
    }
  };

  if (status === 'loading' && !settings) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-[520px]" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Seo title="Store settings" description="KHARNA store settings" noIndex />

      <div>
        <p className="eyebrow">Configuration</p>
        <h1 className="mt-1 font-display text-3xl text-ink">Store settings</h1>
        <p className="mt-1 text-sm text-bamboo-700">
          The words and numbers shown across the storefront.
        </p>
      </div>

      {saveError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {saveError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <section className="card-warm space-y-4 p-5">
            <h2 className="font-display text-xl text-ink">Home hero</h2>

            <div>
              <label htmlFor="heroHeadline" className="label-base">
                Headline
              </label>
              <input
                id="heroHeadline"
                type="text"
                className="input-base"
                {...register('heroHeadline')}
              />
              {errors.heroHeadline && (
                <p className="mt-1 text-xs text-red-700">{errors.heroHeadline.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="heroSubline" className="label-base">
                Subline
              </label>
              <textarea
                id="heroSubline"
                rows={3}
                className="input-base"
                {...register('heroSubline')}
              />
              {errors.heroSubline && (
                <p className="mt-1 text-xs text-red-700">{errors.heroSubline.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="announcement" className="label-base">
                Announcement bar
              </label>
              <input
                id="announcement"
                type="text"
                className="input-base"
                maxLength={160}
                {...register('announcement')}
              />
              <p className="mt-1 text-xs text-bamboo-600">
                Keep it factual — delivery and returns, not a countdown to a discount.
              </p>
              {errors.announcement && (
                <p className="mt-1 text-xs text-red-700">{errors.announcement.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="chhathDate" className="label-base">
                Chhath Puja date
              </label>
              <input
                id="chhathDate"
                type="date"
                className="input-base sm:max-w-xs"
                {...register('chhathDate')}
              />
              <p className="mt-1 text-xs text-bamboo-600">
                Drives the countdown on the home page.
              </p>
              {errors.chhathDate && (
                <p className="mt-1 text-xs text-red-700">{errors.chhathDate.message}</p>
              )}
            </div>
          </section>

          <section className="card-warm space-y-4 p-5">
            <h2 className="font-display text-xl text-ink">Delivery</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="freeShippingThreshold" className="label-base">
                  Free delivery above (₹)
                </label>
                <input
                  id="freeShippingThreshold"
                  type="number"
                  min="0"
                  className="input-base"
                  {...register('freeShippingThreshold')}
                />
                {errors.freeShippingThreshold && (
                  <p className="mt-1 text-xs text-red-700">
                    {errors.freeShippingThreshold.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="shippingFee" className="label-base">
                  Delivery fee (₹)
                </label>
                <input
                  id="shippingFee"
                  type="number"
                  min="0"
                  className="input-base"
                  {...register('shippingFee')}
                />
                {errors.shippingFee && (
                  <p className="mt-1 text-xs text-red-700">{errors.shippingFee.message}</p>
                )}
              </div>
            </div>
          </section>

          <section className="card-warm space-y-4 p-5">
            <h2 className="font-display text-xl text-ink">Contact</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className="label-base">
                  Phone
                </label>
                <input id="phone" type="tel" className="input-base" {...register('phone')} />
                {errors.phone && <p className="mt-1 text-xs text-red-700">{errors.phone.message}</p>}
              </div>
              <div>
                <label htmlFor="email" className="label-base">
                  Email
                </label>
                <input id="email" type="email" className="input-base" {...register('email')} />
                {errors.email && <p className="mt-1 text-xs text-red-700">{errors.email.message}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="address" className="label-base">
                Address
              </label>
              <textarea id="address" rows={2} className="input-base" {...register('address')} />
              {errors.address && (
                <p className="mt-1 text-xs text-red-700">{errors.address.message}</p>
              )}
            </div>
          </section>

          <div className="flex justify-end">
            <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
              <Save className="h-4 w-4" aria-hidden="true" />
              Save settings
            </Button>
          </div>
        </div>

        <aside className="space-y-5">
          <section className="card-warm p-5">
            <h2 className="flex items-center gap-2 font-display text-xl text-ink">
              <CreditCard className="h-5 w-5 text-flame-600" aria-hidden="true" />
              Payments
            </h2>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-bamboo-700">Cash on delivery</span>
                <Badge tone="success">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-bamboo-700">Razorpay</span>
                <Badge tone={payments?.razorpayEnabled ? 'success' : 'neutral'}>
                  {payments?.razorpayEnabled ? 'Configured' : 'Not configured'}
                </Badge>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-bamboo-600">
              Razorpay switches on automatically when test or live keys are set in the backend
              environment. Keys are never stored here.
            </p>
          </section>

          <section className="card-warm p-5">
            <h2 className="flex items-center gap-2 font-display text-lg text-ink">
              <Info className="h-4 w-4 text-flame-600" aria-hidden="true" />
              Copy reminders
            </h2>
            <ul className="mt-2 space-y-2 text-xs leading-relaxed text-bamboo-700">
              <li>Speak about devotion, fabric and the days of Chhath with warmth.</li>
              <li>Never use thekua, soop or the arghya as a discount trick.</li>
              <li>Keep Hindi lines short and respectful.</li>
              <li>Note that business details are still placeholders: GSTIN, address and phone.</li>
            </ul>
          </section>
        </aside>
      </form>
    </div>
  );
}
