import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail } from 'lucide-react';
import Seo from '../components/seo/Seo.jsx';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import Button from '../components/ui/Button.jsx';
import { forgotPassword } from '../services/auth.service.js';
import { useT } from '../i18n/useT.js';

const makeSchema = (t) =>
  z.object({
    email: z.string().trim().email(t('auth.forgot.validation.email')),
  });

export default function ForgotPassword() {
  const [sent, setSent] = useState(null);
  const [formError, setFormError] = useState('');
  const { t } = useT();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(makeSchema(t)), defaultValues: { email: '' } });

  const onSubmit = async ({ email }) => {
    setFormError('');
    try {
      const response = await forgotPassword(email);
      setSent({
        devResetUrl: response.data?.devResetUrl || '',
      });
    } catch (requestError) {
      setFormError(requestError.message || t('auth.forgot.errorSend'));
    }
  };

  return (
    <>
      <Seo
        title={t('auth.forgot.seoTitle')}
        description={t('auth.forgot.seoDescription')}
        path="/forgot-password"
        noIndex
      />
      <AuthLayout
        eyebrow={t('auth.forgot.eyebrow')}
        title={t('auth.forgot.title')}
        subtitle={t('auth.forgot.subtitle')}
        footer={
          <p>
            {t('auth.forgot.remembered')}{' '}
            <Link to="/login" className="font-medium text-sindoor-700 hover:underline">
              {t('auth.forgot.backToSignIn')}
            </Link>
          </p>
        }
      >
        {sent ? (
          <div className="space-y-4">
            <div className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-emerald-900">{t('auth.forgot.checkInbox')}</p>
                <p className="mt-1 text-xs leading-relaxed text-emerald-800">{t('auth.forgot.sentCopy')}</p>
              </div>
            </div>

            {sent.devResetUrl && (
              <div className="rounded-2xl border border-sun-300 bg-sun-50 p-4 text-xs leading-relaxed text-bamboo-800">
                <p className="font-medium text-ink">{t('auth.forgot.devMode')}</p>
                <p className="mt-1">
                  {t('auth.forgot.devCopy')}
                </p>
                <Link
                  to={sent.devResetUrl.replace(/^https?:\/\/[^/]+/, '')}
                  className="mt-2 inline-block font-medium text-sindoor-700 underline"
                >
                  {t('auth.forgot.openLink')}
                </Link>
              </div>
            )}

            <Button variant="secondary" onClick={() => setSent(null)}>
              {t('auth.forgot.useDifferent')}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {formError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                {formError}
              </div>
            )}

            <div>
              <label htmlFor="forgot-email" className="label-base">{t('auth.forgot.email')}</label>
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                className="input-base"
                aria-invalid={Boolean(errors.email)}
                {...register('email')}
              />
              {errors.email && <p className="mt-1 text-xs text-red-700">{errors.email.message}</p>}
            </div>

            <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
              {t('auth.forgot.submit')}
            </Button>
          </form>
        )}
      </AuthLayout>
    </>
  );
}
