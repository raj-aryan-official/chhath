import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Seo from '../components/seo/Seo.jsx';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import PasswordInput from '../components/auth/PasswordInput.jsx';
import Button from '../components/ui/Button.jsx';
import { register as registerUser, selectUser } from '../store/slices/authSlice.js';
import { toast } from '../store/index.js';
import { useT } from '../i18n/useT.js';

const makeSchema = (t) =>
  z
    .object({
      name: z.string().trim().min(2, t('auth.register.validation.name')).max(80),
      email: z.string().trim().email(t('auth.register.validation.email')),
      phone: z
        .string()
        .trim()
        .regex(/^[6-9]\d{9}$/, t('auth.register.validation.phone'))
        .or(z.literal(''))
        .optional(),
      password: z
        .string()
        .min(8, t('auth.register.validation.passwordMin'))
        .regex(/[A-Za-z]/, t('auth.register.validation.passwordLetter'))
        .regex(/\d/, t('auth.register.validation.passwordNumber')),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.register.validation.passwordMatch'),
      path: ['confirmPassword'],
    });

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const user = useSelector(selectUser);
  const [formError, setFormError] = useState('');
  const { t } = useT();

  const rawFrom = location.state?.from || searchParams.get('redirect') || '/';
  const from = typeof rawFrom === 'string' && rawFrom.startsWith('/') ? rawFrom : '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(makeSchema(t)),
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
  });

  if (user) return <Navigate to={from} replace />;

  const onSubmit = async ({ confirmPassword: _confirmPassword, ...values }) => {
    setFormError('');
    try {
      await dispatch(registerUser(values)).unwrap();
      toast.success(t('auth.register.welcomeToast'));
      navigate(from, { replace: true });
    } catch (requestError) {
      setFormError(
        requestError?.response?.status === 409
          ? t('auth.register.errorExists')
          : requestError?.message || t('auth.register.errorCreate')
      );
    }
  };

  return (
    <>
      <Seo
        title={t('auth.register.seoTitle')}
        description={t('auth.register.seoDescription')}
        path="/register"
        noIndex
      />
      <AuthLayout
        eyebrow={t('auth.register.eyebrow')}
        title={t('auth.register.title')}
        subtitle={t('auth.register.subtitle')}
        footer={
          <p>
            {t('auth.register.haveAccount')}{' '}
            <Link to="/login" state={{ from }} className="font-medium text-sindoor-700 hover:underline">
              {t('auth.register.signIn')}
            </Link>
          </p>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {formError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              {formError}
            </div>
          )}

          <div>
            <label htmlFor="reg-name" className="label-base">{t('auth.register.name')}</label>
            <input
              id="reg-name"
              autoComplete="name"
              className="input-base"
              aria-invalid={Boolean(errors.name)}
              {...register('name')}
            />
            {errors.name && <p className="mt-1 text-xs text-red-700">{errors.name.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="reg-email" className="label-base">{t('auth.register.email')}</label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                className="input-base"
                aria-invalid={Boolean(errors.email)}
                {...register('email')}
              />
              {errors.email && <p className="mt-1 text-xs text-red-700">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="reg-phone" className="label-base">{t('auth.register.phone')}</label>
              <input
                id="reg-phone"
                inputMode="numeric"
                maxLength={10}
                autoComplete="tel"
                className="input-base"
                aria-invalid={Boolean(errors.phone)}
                {...register('phone')}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-700">{errors.phone.message}</p>}
            </div>
          </div>

          <PasswordInput
            id="reg-password"
            label={t('auth.register.password')}
            autoComplete="new-password"
            error={errors.password}
            hint={t('auth.register.hint')}
            {...register('password')}
          />

          <PasswordInput
            id="reg-confirm"
            label={t('auth.register.confirmPassword')}
            autoComplete="new-password"
            error={errors.confirmPassword}
            {...register('confirmPassword')}
          />

          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
            {t('auth.register.submit')}
          </Button>
        </form>
      </AuthLayout>
    </>
  );
}
