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
import { login, selectUser } from '../store/slices/authSlice.js';
import { toast } from '../store/index.js';
import { useT } from '../i18n/useT.js';

const makeSchema = (t) =>
  z.object({
    email: z.string().trim().email(t('auth.login.validation.email')),
    password: z.string().min(1, t('auth.login.validation.password')),
  });

export default function Login() {
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
    defaultValues: { email: '', password: '' },
  });

  if (user) return <Navigate to={from} replace />;

  const onSubmit = async (values) => {
    setFormError('');
    try {
      await dispatch(login(values)).unwrap();
      toast.success(t('auth.login.welcomeToast'));
      navigate(from, { replace: true });
    } catch (requestError) {
      setFormError(
        requestError?.response?.status === 401 ? t('auth.login.errorInvalid') : requestError?.message || t('auth.login.errorInvalid')
      );
    }
  };

  return (
    <>
      <Seo
        title={t('auth.login.seoTitle')}
        description={t('auth.login.seoDescription')}
        path="/login"
        noIndex
      />
      <AuthLayout
        eyebrow={t('auth.login.eyebrow')}
        title={t('auth.login.title')}
        subtitle={t('auth.login.subtitle')}
        footer={
          <p>
            {t('auth.login.newHere')}{' '}
            <Link
              to="/register"
              state={{ from }}
              className="font-medium text-sindoor-700 hover:underline"
            >
              {t('auth.login.createAccount')}
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
            <label htmlFor="login-email" className="label-base">
              {t('auth.login.email')}
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              className="input-base"
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
            />
            {errors.email && <p className="mt-1 text-xs text-red-700">{errors.email.message}</p>}
          </div>

          <PasswordInput
            id="login-password"
            label={t('auth.login.password')}
            autoComplete="current-password"
            error={errors.password}
            {...register('password')}
          />

          <div className="flex items-center justify-between text-xs">
            <Link to="/forgot-password" className="font-medium text-sindoor-700 hover:underline">
              {t('auth.login.forgot')}
            </Link>
          </div>

          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
            {t('auth.login.submit')}
          </Button>

          {import.meta.env.DEV && (
            <p className="rounded-xl bg-sun-50 px-3 py-2 text-[11px] leading-relaxed text-bamboo-700">
              {t('auth.login.demo')} <strong>demo@kharna.in</strong> / <strong>Demo@12345</strong>
            </p>
          )}
        </form>
      </AuthLayout>
    </>
  );
}
