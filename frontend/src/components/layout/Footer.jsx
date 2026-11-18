import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { ArrowRight, Mail } from 'lucide-react';
import KharnaLogo from '../brand/KharnaLogo.jsx';
import LanguageToggle from './LanguageToggle.jsx';
import { CHHATH_DAYS, FABRICS } from '../../utils/constants.js';
import { toast } from '../../store/index.js';
import { useT } from '../../i18n/useT.js';
import { useCatalogText } from '../../i18n/useCatalogText.js';

export default function Footer() {
  const contact = useSelector((state) => state.settings.settings?.contact);
  const [email, setEmail] = useState('');
  const { t } = useT();
  const { dayLabel, fabricLabel } = useCatalogText();

  const helpLinks = [
    { to: '/faq', label: t('common.footer.faq') },
    { to: '/shipping-returns', label: t('common.footer.shipping') },
    { to: '/contact', label: t('common.footer.contact') },
    { to: '/privacy', label: t('common.footer.privacy') },
    { to: '/terms', label: t('common.footer.terms') },
  ];

  const onSubscribe = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    // TODO: connect the newsletter form to your email provider.
    toast.success(t('common.footer.subscribed'));
    setEmail('');
  };

  return (
    <footer className="mt-24 bg-bamboo-900 text-sun-50">
      <div className="container-page grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <KharnaLogo to="/" variant="horizontal" mono markClassName="h-11 w-11" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-sun-100/75">
            {t('common.footer.tagline')}
          </p>
          <p className="mt-4 font-devanagari text-base text-sun-200">{t('common.footer.blessing')}</p>
          <div className="mt-5">
            <LanguageToggle />
          </div>
          <div className="mt-6 space-y-1 text-sm text-sun-100/75">
            {contact?.email && (
              <a href={`mailto:${contact.email}`} className="flex items-center gap-2 hover:text-sun-200">
                <Mail className="h-4 w-4" aria-hidden="true" />
                {contact.email}
              </a>
            )}
            {contact?.phone && <p>{contact.phone}</p>}
            {contact?.address && <p className="max-w-xs">{contact.address}</p>}
          </div>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-flame-300">
            {t('common.footer.shopHeading')}
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-sun-100/80">
            <li>
              <Link to="/shop" className="hover:text-white">
                {t('common.footer.allSarees')}
              </Link>
            </li>
            {CHHATH_DAYS.map((day) => (
              <li key={day.name}>
                <Link to={`/shop?day=${encodeURIComponent(day.name)}`} className="hover:text-white">
                  {dayLabel(day.name)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-flame-300">
            {t('common.footer.collectionsHeading')}
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-sun-100/80">
            {FABRICS.map((fabric) => (
              <li key={fabric.name}>
                <Link
                  to={`/shop?fabric=${encodeURIComponent(fabric.name)}`}
                  className="hover:text-white"
                >
                  {fabricLabel(fabric.name)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-flame-300">
            {t('common.footer.helpHeading')}
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-sun-100/80">
            {helpLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <form onSubmit={onSubscribe} className="mt-7">
            <label htmlFor="newsletter-email" className="text-[11px] font-semibold uppercase tracking-[0.24em] text-flame-300">
              {t('common.footer.letters')}
            </label>
            <p className="mt-2 text-xs leading-relaxed text-sun-100/65">
              {t('common.footer.lettersCopy')}
            </p>
            <div className="mt-3 flex overflow-hidden rounded-full border border-white/20 bg-white/5 focus-within:border-flame-300">
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t('common.footer.emailPlaceholder')}
                className="w-full bg-transparent px-4 py-2.5 text-sm text-white placeholder:text-sun-100/40 focus:outline-none"
              />
              <button
                type="submit"
                className="flex items-center gap-1 bg-flame-500 px-4 text-xs font-semibold text-ink transition hover:bg-sun-300"
              >
                {t('common.footer.join')}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-[11px] leading-relaxed text-sun-100/55 sm:flex-row sm:items-center sm:justify-between">
          <p>{t('common.footer.copyright', { year: new Date().getFullYear() })}</p>
          <p>{t('common.footer.payments')}</p>
        </div>
      </div>
    </footer>
  );
}
