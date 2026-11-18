import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, MapPin, Package, Pencil, Plus, Trash2, User } from 'lucide-react';
import Seo from '../components/seo/Seo.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import PasswordInput from '../components/auth/PasswordInput.jsx';
import {
  removeAddress,
  saveAddress,
  updateProfile,
} from '../store/slices/authSlice.js';
import { changePassword } from '../services/account.service.js';
import { toast } from '../store/index.js';
import { cx } from '../utils/format.js';

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number')
    .or(z.literal(''))
    .optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z
      .string()
      .min(8, 'Use at least 8 characters')
      .regex(/[A-Za-z]/, 'Include at least one letter')
      .regex(/\d/, 'Include at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const addressSchema = z.object({
  label: z.string().trim().max(40).optional(),
  fullName: z.string().trim().min(2, 'Name is required').max(80),
  line1: z.string().trim().min(4, 'Address is required').max(160),
  line2: z.string().trim().max(160).optional().or(z.literal('')),
  city: z.string().trim().min(2, 'City is required').max(80),
  state: z.string().trim().min(2, 'State is required').max(80),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  isDefault: z.boolean().optional(),
});

const ACCOUNT_LINKS = [
  { to: '/account/orders', label: 'My orders', icon: Package },
  { to: '/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/account/profile', label: 'Profile & addresses', icon: User },
];

export default function Profile() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [addressOpen, setAddressOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', phone: user?.phone || '' },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const addressForm = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: 'Home',
      fullName: user?.name || '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      phone: user?.phone || '',
      isDefault: false,
    },
  });

  useEffect(() => {
    if (!addressOpen) return;
    if (editingAddress) {
      addressForm.reset({
        label: editingAddress.label || 'Home',
        fullName: editingAddress.fullName || '',
        line1: editingAddress.line1 || '',
        line2: editingAddress.line2 || '',
        city: editingAddress.city || '',
        state: editingAddress.state || '',
        pincode: editingAddress.pincode || '',
        phone: editingAddress.phone || '',
        isDefault: Boolean(editingAddress.isDefault),
      });
    } else {
      addressForm.reset({
        label: 'Home',
        fullName: user?.name || '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
        phone: user?.phone || '',
        isDefault: (user?.addresses || []).length === 0,
      });
    }
  }, [addressOpen, editingAddress, addressForm, user]);

  const onSaveProfile = async (values) => {
    try {
      await dispatch(updateProfile(values)).unwrap();
      toast.success('Profile updated');
    } catch (requestError) {
      toast.error(requestError?.message || 'Could not update your profile.');
    }
  };

  const onChangePassword = async (values) => {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success('Password changed');
      passwordForm.reset();
    } catch (requestError) {
      toast.error(requestError.message || 'Could not change your password.');
    }
  };

  const onSaveAddress = async (values) => {
    setSavingAddress(true);
    try {
      await dispatch(
        saveAddress({ ...(editingAddress ? { id: editingAddress._id } : {}), ...values })
      ).unwrap();
      toast.success(editingAddress ? 'Address updated' : 'Address saved');
      setAddressOpen(false);
      setEditingAddress(null);
    } catch (requestError) {
      toast.error(requestError?.message || 'Could not save this address.');
    } finally {
      setSavingAddress(false);
    }
  };

  const onDeleteAddress = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await dispatch(removeAddress(deleteTarget._id)).unwrap();
      toast.success('Address removed');
      setDeleteTarget(null);
    } catch (requestError) {
      toast.error(requestError?.message || 'Could not remove this address.');
    } finally {
      setDeleting(false);
    }
  };

  const addresses = user?.addresses || [];

  return (
    <>
      <Seo title="Profile & addresses" noIndex path="/account/profile" />

      <div className="container-page py-10">
        <p className="eyebrow">Your account</p>
        <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">Profile &amp; addresses</h1>
        <p className="mt-1 text-sm text-bamboo-700">
          Keep your details current so your sarees reach the right hands.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr] lg:items-start">
          <aside className="rounded-2xl border border-sun-200 bg-white/70 p-2 lg:sticky lg:top-24">
            <nav className="flex gap-1 overflow-x-auto lg:flex-col" aria-label="Account">
              {ACCOUNT_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cx(
                    'flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition',
                    link.to === '/account/profile'
                      ? 'bg-sun-100 font-medium text-sindoor-700'
                      : 'text-bamboo-800 hover:bg-sun-50'
                  )}
                >
                  <link.icon className="h-4 w-4" aria-hidden="true" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </aside>

          <div className="space-y-6">
            <section className="rounded-2xl border border-sun-200 bg-white/85 p-5">
              <h2 className="font-display text-xl text-ink">Your details</h2>
              <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="mt-4 grid gap-4 sm:grid-cols-2" noValidate>
                <div>
                  <label htmlFor="profile-name" className="label-base">Full name</label>
                  <input
                    id="profile-name"
                    autoComplete="name"
                    className="input-base"
                    aria-invalid={Boolean(profileForm.formState.errors.name)}
                    {...profileForm.register('name')}
                  />
                  {profileForm.formState.errors.name && (
                    <p className="mt-1 text-xs text-red-700">{profileForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="profile-phone" className="label-base">Mobile</label>
                  <input
                    id="profile-phone"
                    inputMode="numeric"
                    maxLength={10}
                    autoComplete="tel"
                    className="input-base"
                    aria-invalid={Boolean(profileForm.formState.errors.phone)}
                    {...profileForm.register('phone')}
                  />
                  {profileForm.formState.errors.phone && (
                    <p className="mt-1 text-xs text-red-700">{profileForm.formState.errors.phone.message}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="profile-email" className="label-base">Email</label>
                  <input id="profile-email" value={user?.email || ''} readOnly disabled className="input-base" />
                  <p className="mt-1 text-[11px] text-bamboo-600">
                    Email changes are not supported yet. Contact us if you need to update it.
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" loading={profileForm.formState.isSubmitting}>
                    Save details
                  </Button>
                </div>
              </form>
            </section>

            <section className="rounded-2xl border border-sun-200 bg-white/85 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 font-display text-xl text-ink">
                    <MapPin className="h-5 w-5 text-flame-600" aria-hidden="true" />
                    Saved addresses
                  </h2>
                  <p className="mt-1 text-xs text-bamboo-600">Used to prefill checkout.</p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setEditingAddress(null);
                    setAddressOpen(true);
                  }}
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  Add address
                </Button>
              </div>

              {addresses.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-sun-300 bg-sun-50/60 p-5 text-sm text-bamboo-700">
                  No addresses saved yet. Add one now, or save an address during checkout.
                </p>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      className="rounded-2xl border border-sun-200 bg-cream/70 p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-ink">
                            {address.fullName}
                            {address.label && (
                              <span className="rounded-full bg-sun-100 px-2 py-0.5 text-[10px] text-bamboo-700">
                                {address.label}
                              </span>
                            )}
                            {address.isDefault && (
                              <span className="rounded-full bg-sindoor-700/10 px-2 py-0.5 text-[10px] text-sindoor-700">
                                Default
                              </span>
                            )}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-bamboo-700">
                            {[address.line1, address.line2, address.city, address.state, address.pincode]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                          <p className="mt-1 text-[11px] text-bamboo-600">{address.phone}</p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAddress(address);
                              setAddressOpen(true);
                            }}
                            className="rounded-full p-1.5 text-bamboo-600 transition hover:bg-sun-100 hover:text-sindoor-700"
                            aria-label={`Edit address for ${address.fullName}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(address)}
                            className="rounded-full p-1.5 text-bamboo-600 transition hover:bg-red-50 hover:text-red-700"
                            aria-label={`Delete address for ${address.fullName}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-sun-200 bg-white/85 p-5">
              <h2 className="font-display text-xl text-ink">Change password</h2>
              <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="mt-4 grid gap-4 sm:grid-cols-2" noValidate>
                <div className="sm:col-span-2">
                  <PasswordInput
                    id="current-password"
                    label="Current password"
                    autoComplete="current-password"
                    error={passwordForm.formState.errors.currentPassword}
                    {...passwordForm.register('currentPassword')}
                  />
                </div>
                <PasswordInput
                  id="new-password"
                  label="New password"
                  autoComplete="new-password"
                  error={passwordForm.formState.errors.newPassword}
                  {...passwordForm.register('newPassword')}
                />
                <PasswordInput
                  id="confirm-password"
                  label="Confirm new password"
                  autoComplete="new-password"
                  error={passwordForm.formState.errors.confirmPassword}
                  {...passwordForm.register('confirmPassword')}
                />
                <div className="sm:col-span-2">
                  <Button type="submit" loading={passwordForm.formState.isSubmitting}>
                    Update password
                  </Button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>

      <Modal
        open={addressOpen}
        onClose={() => {
          setAddressOpen(false);
          setEditingAddress(null);
        }}
        title={editingAddress ? 'Edit address' : 'Add a new address'}
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setAddressOpen(false);
                setEditingAddress(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={addressForm.handleSubmit(onSaveAddress)} loading={savingAddress}>
              {editingAddress ? 'Save changes' : 'Save address'}
            </Button>
          </div>
        }
      >
        <form onSubmit={addressForm.handleSubmit(onSaveAddress)} className="grid gap-3 sm:grid-cols-2" noValidate>
          <div>
            <label htmlFor="addr-label" className="label-base">Label</label>
            <input id="addr-label" className="input-base" placeholder="Home, work, village…" {...addressForm.register('label')} />
          </div>
          <div>
            <label htmlFor="addr-name" className="label-base">Full name</label>
            <input id="addr-name" className="input-base" {...addressForm.register('fullName')} />
            {addressForm.formState.errors.fullName && (
              <p className="mt-1 text-xs text-red-700">{addressForm.formState.errors.fullName.message}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="addr-line1" className="label-base">Address</label>
            <input id="addr-line1" className="input-base" {...addressForm.register('line1')} />
            {addressForm.formState.errors.line1 && (
              <p className="mt-1 text-xs text-red-700">{addressForm.formState.errors.line1.message}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="addr-line2" className="label-base">Landmark (optional)</label>
            <input id="addr-line2" className="input-base" {...addressForm.register('line2')} />
          </div>
          <div>
            <label htmlFor="addr-city" className="label-base">City / town</label>
            <input id="addr-city" className="input-base" {...addressForm.register('city')} />
            {addressForm.formState.errors.city && (
              <p className="mt-1 text-xs text-red-700">{addressForm.formState.errors.city.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="addr-state" className="label-base">State</label>
            <input id="addr-state" className="input-base" {...addressForm.register('state')} />
            {addressForm.formState.errors.state && (
              <p className="mt-1 text-xs text-red-700">{addressForm.formState.errors.state.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="addr-pin" className="label-base">Pincode</label>
            <input id="addr-pin" inputMode="numeric" maxLength={6} className="input-base" {...addressForm.register('pincode')} />
            {addressForm.formState.errors.pincode && (
              <p className="mt-1 text-xs text-red-700">{addressForm.formState.errors.pincode.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="addr-phone" className="label-base">Mobile</label>
            <input id="addr-phone" inputMode="numeric" maxLength={10} className="input-base" {...addressForm.register('phone')} />
            {addressForm.formState.errors.phone && (
              <p className="mt-1 text-xs text-red-700">{addressForm.formState.errors.phone.message}</p>
            )}
          </div>
          <label className="sm:col-span-2 flex items-center gap-2 text-xs text-bamboo-700">
            <input type="checkbox" {...addressForm.register('isDefault')} />
            Use as my default delivery address
          </label>
        </form>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Remove this address?"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Keep it
            </Button>
            <Button variant="danger" onClick={onDeleteAddress} loading={deleting}>
              Remove
            </Button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-bamboo-700">
          {deleteTarget
            ? `${deleteTarget.label || 'This address'} for ${deleteTarget.fullName} will be removed from your account. Past orders keep their delivery snapshot.`
            : ''}
        </p>
      </Modal>
    </>
  );
}
