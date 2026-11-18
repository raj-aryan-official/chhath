import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Seo from '../components/seo/Seo.jsx';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import PasswordInput from '../components/auth/PasswordInput.jsx';
import Button from '../components/ui/Button.jsx';
import { fetchMe } from '../store/slices/authSlice.js';
import { resetPassword } from '../services/auth.service.js';
import { toast } from '../store/index.js';
import { useT } from '../i18n/useT.js';

const makeSchema = (t) =>
  z
    .object({
      password: z
        .string()
        .min(8, t('auth.reset.validation.passwordMin'))
        .regex(/[A-Za-z]/, t('auth.reset.validation.passwordLetter'))
        .regex(/\d/, t('auth.reset.validation.passwordNumber')),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.reset.validation.passwordMatch'),
      path: ['confirmPassword'],
    });

export default function ResetPassword() {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formError, setFormError] = useState('');
  const { t } = useT();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(makeSchema(t)), defaultValues: { password: '', confirmPassword: '' } });

  const onSubmit = async ({ password }) => {
    setFormError('');
    try {
      await resetPassword(token, password);
      await dispatch(fetchMe(true)).unwrap().catch(() => {});
      toast.success(t('auth.reset.successToast'));
      navigate('/', { replace: true });
    } catch (requestError) {
      setFormError(
        requestError?.response?.status === 400
          ? t('auth.reset.errorInvalid')
          : requestError?.message || t('auth.reset.errorInvalid')
      );
    }
  };

  return (
    <>
      <Seo
        title={t('auth.reset.seoTitle')}
        description={t('auth.reset.seoDescription')}
        noIndex
      />
      <AuthLayout
        eyebrow={t('auth.reset.eyebrow')}
        title={t('auth.reset.title')}
        subtitle={t('auth.reset.subtitle')}
        footer={
          <p>
            {t('auth.reset.linkExpired')}{' '}
            <Link to="/forgot-password" className="font-medium text-sindoor-700 hover:underline">
              {t('auth.reset.requestNew')}
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

          <PasswordInput
            id="reset-password"
            label={t('auth.reset.newPassword')}
            autoComplete="new-password"
            error={errors.password}
            hint={t('auth.reset.hint')}
            {...register('password')}
          />
          <PasswordInput
            id="reset-confirm"
            label={t('auth.reset.confirmNewPassword')}
            autoComplete="new-password"
            error={errors.confirmPassword}
            {...register('confirmPassword')}
          />

          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
            {t('auth.reset.submit')}
          </Button>
        </form>
      </AuthLayout>
    </>
  );
}
