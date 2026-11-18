import { Link } from 'react-router-dom';
import KharnaLogo from '../brand/KharnaLogo.jsx';
import DiyaDivider from '../brand/DiyaDivider.jsx';
import { useT } from '../../i18n/useT.js';

export default function AuthLayout({ eyebrow, title, subtitle, children, footer }) {
  const { t } = useT();

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-sun-200 bg-white/85 shadow-warm-lg lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden overflow-hidden bg-sunrise p-8 lg:flex lg:flex-col lg:justify-between">
          <div className="soop-weave absolute inset-0 opacity-30" aria-hidden="true" />
          <div className="relative">
            <KharnaLogo variant="horizontal" markClassName="h-11 w-11" showTagline />
            <p className="mt-10 font-display text-3xl leading-tight text-ink">
              {t('auth.layout.title')}
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink/75">
              {t('auth.layout.copy')}
            </p>
            <p className="mt-8 font-devanagari text-lg text-sindoor-700">छठ मैया की कृपा बनी रहे</p>
          </div>
          <div className="relative">
            <DiyaDivider className="text-sindoor-700/70" />
            <p className="mt-2 text-[11px] tracking-[0.2em] text-ink/60">{t('auth.layout.tagline')}</p>
          </div>
        </aside>

        <section className="p-6 sm:p-10">
          <div className="lg:hidden">
            <KharnaLogo to="/" markClassName="h-9 w-9" />
          </div>
          <div className="mt-6 lg:mt-0">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1 className="mt-2 font-display text-3xl text-ink sm:text-[2.1rem]">{title}</h1>
            {subtitle && <p className="mt-2 text-sm leading-relaxed text-bamboo-700">{subtitle}</p>}
          </div>

          <div className="mt-6">{children}</div>

          {footer && <div className="mt-6 border-t border-sun-200 pt-4 text-sm text-bamboo-700">{footer}</div>}

          <p className="mt-6 text-[11px] leading-relaxed text-bamboo-600">
            {t('auth.layout.legalBefore')}{' '}
            <Link to="/terms" className="font-medium text-sindoor-700 hover:underline">
              {t('auth.layout.terms')}
            </Link>{' '}
            {t('auth.layout.legalMiddle')}{' '}
            <Link to="/privacy" className="font-medium text-sindoor-700 hover:underline">
              {t('auth.layout.privacy')}
            </Link>
            {t('auth.layout.legalAfter')}
          </p>
        </section>
      </div>
    </div>
  );
}
