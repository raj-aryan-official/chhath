import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowRight,
  CalendarDays,
  HandHeart,
  Leaf,
  Moon,
  Quote,
  RotateCcw,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  Truck,
  Waves,
} from 'lucide-react';
import Seo from '../components/seo/Seo.jsx';
import Button from '../components/ui/Button.jsx';
import LazyImage from '../components/ui/LazyImage.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import Reveal from '../components/ui/Reveal.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import DiyaDivider from '../components/brand/DiyaDivider.jsx';
import { KharnaMark } from '../components/brand/KharnaLogo.jsx';
import { fetchProducts } from '../services/catalog.service.js';
import { loadSettings } from '../store/slices/settingsSlice.js';
import { toast } from '../store/index.js';
import { useCountdown } from '../hooks/useCountdown.js';
import { useT } from '../i18n/useT.js';
import { useLocalized } from '../i18n/useLocalized.js';
import { useCatalogText } from '../i18n/useCatalogText.js';
import { CHHATH_DAYS, FABRICS } from '../utils/constants.js';
import { formatDate, formatINR } from '../utils/format.js';

const DAY_ICONS = [Waves, Moon, Sunset, Sunrise];
const TRUST_ICONS = [Truck, Leaf, RotateCcw, CalendarDays];
const REASON_ICONS = [HandHeart, Sparkles, Leaf, Truck];

function CountdownCell({ value, label }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-center backdrop-blur-sm sm:px-5">
      <p className="font-display text-2xl tabular-nums text-white sm:text-3xl">
        {String(value).padStart(2, '0')}
      </p>
      <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.24em] text-sun-100/80">{label}</p>
    </div>
  );
}

export default function Home() {
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.settings.settings);
  const { t, tList, lang } = useT();
  const { pick } = useLocalized();
  const { fabricLabel, dayLabel } = useCatalogText();
  const trust = tList('home.trust');
  const reasons = tList('home.reasons');
  const testimonials = tList('home.testimonials.items');
  const [featured, setFeatured] = useState([]);
  const [newest, setNewest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const countdown = useCountdown(settings?.chhathDate);

  const heroHeadline =
    (lang === 'hi' ? settings?.heroHeadlineHi || settings?.heroHeadline : settings?.heroHeadline) ||
    t('home.hero.headline');
  const heroSubline =
    (lang === 'hi' ? settings?.heroSublineHi || settings?.heroSubline : settings?.heroSubline) ||
    t('home.hero.subline');

  useEffect(() => {
    let cancelled = false;
    dispatch(loadSettings());

    Promise.all([
      fetchProducts({ featured: 'true', limit: 8 }),
      fetchProducts({ sort: 'newest', limit: 4 }),
    ])
      .then(([featuredResult, newestResult]) => {
        if (cancelled) return;
        setFeatured(featuredResult.products);
        setNewest(newestResult.products);
      })
      .catch(() => {
        if (!cancelled) setFeatured([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const heroProduct = featured[0] || newest[0];

  const onSubscribe = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    // TODO: connect the newsletter form to your email provider.
    toast.success(t('home.newsletter.thanks'));
    setEmail('');
  };

  return (
    <>
      <Seo
        description={t('common.siteDescription')}
        path="/"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Store',
          name: 'KHARNA',
          description: 'Chhath Puja sarees woven in Bihar and Banaras.',
          url: 'https://kharna.in',
        }}
      />

      <section className="relative overflow-hidden bg-sunrise-soft">
        <div className="soop-weave absolute inset-0 opacity-50" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-40 top-1/2 h-[560px] w-[560px] -translate-y-1/2 rounded-full sun-rays"
          aria-hidden="true"
        />
        <div className="container-page relative grid gap-12 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div>
            <p className="eyebrow flex items-center gap-2">
              <span className="h-px w-8 bg-flame-500" aria-hidden="true" />
              {t('home.hero.eyebrow')}
            </p>
            <h1 className="mt-4 max-w-xl font-display text-[2.6rem] leading-[1.08] text-ink sm:text-5xl lg:text-[3.6rem]">
              {heroHeadline}
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-bamboo-800 sm:text-base">
              {heroSubline}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button to="/shop" size="lg" className="group">
                {t('home.hero.ctaShop')}
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Button>
              <Button to="/shop?day=Sandhya%20Arghya" variant="secondary" size="lg">
                {t('home.hero.ctaSandhya')}
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-bamboo-700">
              <span className="flex items-center gap-1.5">
                <Sun className="h-4 w-4 text-flame-600" aria-hidden="true" />
                {t('home.hero.fromPrice', { price: formatINR(299) })}
              </span>
              <span className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-flame-600" aria-hidden="true" />
                {t('home.hero.freeDelivery')}
              </span>
              <span className="font-devanagari text-sm text-sindoor-700">{t('home.hero.blessing')}</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div
              className="absolute -inset-6 rounded-[3rem] border border-sun-300/70 bg-white/25 blur-[1px]"
              aria-hidden="true"
            />
            <div className="relative overflow-hidden rounded-[2.5rem] border border-sun-200 bg-cream shadow-warm-lg">
              {heroProduct ? (
                <Link to={`/product/${heroProduct.slug}`} className="block">
                  <LazyImage
                    src={heroProduct.images?.[0]}
                    alt={pick(heroProduct, 'name')}
                    aspect="4 / 5"
                    width={900}
                    height={1125}
                    eager
                    wrapperClassName="bg-sun-100"
                    className="transition-transform duration-700 hover:scale-[1.02]"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 via-ink/45 to-transparent p-5 pt-16 text-cream">
                    <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-sun-200">
                      {fabricLabel(heroProduct.fabric)}
                    </p>
                    <p className="mt-1 font-display text-xl">{pick(heroProduct, 'name')}</p>
                    <p className="mt-1 text-sm text-sun-100/85">
                      {formatINR(heroProduct.price)}{' '}
                      {heroProduct.mrp > heroProduct.price && (
                        <span className="text-xs line-through opacity-70">{formatINR(heroProduct.mrp)}</span>
                      )}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="flex aspect-[4/5] flex-col items-center justify-center gap-5 bg-sunrise px-8 text-center">
                  <KharnaMark className="h-28 w-28 drop-shadow" />
                  <p className="font-display text-2xl text-ink">{t('home.hero.altTitle')}</p>
                  <p className="text-sm leading-relaxed text-ink/75">{t('home.hero.altCopy')}</p>
                </div>
              )}
            </div>

            <div className="absolute -left-3 bottom-24 hidden rounded-2xl border border-sun-200 bg-cream/95 px-4 py-3 shadow-warm sm:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-flame-700">
                {t('home.hero.wovenIn')}
              </p>
              <p className="mt-0.5 text-xs text-bamboo-700">{t('home.hero.wovenInCopy')}</p>
            </div>
            <div className="absolute -right-2 top-6 hidden rounded-full border border-sun-200 bg-cream/95 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-sindoor-700 shadow-soft sm:block">
              {t('home.hero.readyBadge')}
            </div>
          </div>
        </div>

        <div className="container-page relative pb-10">
          <div className="grid gap-3 rounded-2xl border border-sun-200/80 bg-cream/80 p-4 backdrop-blur sm:grid-cols-2 lg:grid-cols-4">
            {trust.map((item, index) => {
              const Icon = TRUST_ICONS[index];
              return (
                <div key={item.title} className="flex items-start gap-2.5 p-1.5">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-flame-600" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold text-ink">{item.title}</p>
                    <p className="text-[11px] leading-snug text-bamboo-600">{item.copy}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <Reveal>
          <SectionHeading
            eyebrow={t('home.days.eyebrow')}
            title={t('home.days.title')}
            description={t('home.days.description')}
            action={
              <Button to="/shop" variant="ghost" className="group">
                {t('home.days.action')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Button>
            }
          />
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {CHHATH_DAYS.map((day, index) => {
            const Icon = DAY_ICONS[index];
            return (
              <Reveal key={day.name} delay={index * 0.06}>
                <Link
                  to={`/shop?day=${encodeURIComponent(day.name)}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-sun-200/80 bg-white/80 p-5 transition duration-300 hover:-translate-y-1 hover:border-flame-300 hover:shadow-warm"
                >
                  <span
                    className="pointer-events-none absolute -right-2 -top-4 font-display text-7xl text-sun-200/70 transition group-hover:text-sun-300/80"
                    aria-hidden="true"
                  >
                    {day.numeral}
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sun-100 text-flame-700">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-xl text-ink">{dayLabel(day.name)}</h3>
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-bamboo-700">
                    {lang === 'hi' ? day.blurbHi || day.blurb : day.blurb}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-sindoor-700">
                    {t('home.days.shopDay')}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="relative overflow-hidden bg-white/60 py-16">
        <div className="soop-weave absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="container-page relative">
          <Reveal>
            <SectionHeading
              eyebrow={t('home.featured.eyebrow')}
              title={t('home.featured.title')}
              description={t('home.featured.description')}
              action={
                <Button to="/shop?sort=newest" variant="outline">
                  {t('home.featured.action')}
                </Button>
              }
            />
          </Reveal>
          <div className="mt-8">
            <ProductGrid
              products={featured.slice(0, 4)}
              loading={loading}
              skeletonCount={4}
              emptyTitle={t('home.featured.emptyTitle')}
              emptyDescription={t('home.featured.emptyDescription')}
              emptyAction={<Button to="/shop">{t('home.featured.emptyAction')}</Button>}
            />
          </div>
          <div className="mt-6 flex justify-center">
            <DiyaDivider />
          </div>
        </div>
      </section>

      {newest.length > 0 && (
        <section className="container-page py-16">
          <Reveal>
            <SectionHeading
              eyebrow={t('home.newest.eyebrow')}
              title={t('home.newest.title')}
              description={t('home.newest.description')}
              action={
                <Button to="/shop?sort=newest" variant="ghost" className="group">
                  {t('home.newest.action')}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Button>
              }
            />
          </Reveal>
          <div className="mt-8">
            <ProductGrid products={newest} skeletonCount={4} columns="grid-cols-2 gap-4 md:grid-cols-4" />
          </div>
        </section>
      )}

      <section className="bg-sun-100/70 py-16">
        <div className="container-page">
          <Reveal>
            <SectionHeading
              eyebrow={t('home.fabrics.eyebrow')}
              title={t('home.fabrics.title')}
              description={t('home.fabrics.description')}
              align="center"
            />
          </Reveal>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FABRICS.map((fabric, index) => (
              <Reveal key={fabric.name} delay={index * 0.04}>
                <Link
                  to={`/shop?fabric=${encodeURIComponent(fabric.name)}`}
                  className="group flex h-full items-start justify-between gap-4 rounded-2xl border border-sun-200/80 bg-cream/80 p-5 transition hover:border-flame-300 hover:bg-white"
                >
                  <div>
                    <p className="font-display text-lg text-ink">{fabricLabel(fabric.name)}</p>
                    <p className="mt-1 text-xs leading-relaxed text-bamboo-700">
                      {lang === 'hi' ? fabric.blurbHi || fabric.blurb : fabric.blurb}
                    </p>
                    <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.18em] text-bamboo-600">
                      {t('home.fabrics.care')} · {lang === 'hi' ? fabric.careHi || fabric.care : fabric.care}
                    </p>
                  </div>
                  <ArrowRight
                    className="mt-1 h-4 w-4 shrink-0 text-sindoor-700 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <Reveal>
            <p className="eyebrow">{t('home.story.eyebrow')}</p>
            <h2 className="mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl">
              {t('home.story.title')}
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-bamboo-700">{t('home.story.copy')}</p>
            <p className="mt-5 font-devanagari text-lg text-sindoor-700">{t('home.story.blessing')}</p>
            <div className="mt-6">
              <Button to="/about" variant="outline">
                {t('home.story.action')}
              </Button>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {reasons.map((reason, index) => {
              const Icon = REASON_ICONS[index];
              return (
                <Reveal key={reason.title} delay={index * 0.05}>
                  <div className="h-full rounded-2xl border border-sun-200/80 bg-white/75 p-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sun-100 text-flame-700">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 font-display text-lg leading-snug text-ink">{reason.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-bamboo-700">{reason.copy}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white/60 py-16">
        <div className="container-page">
          <Reveal>
            <SectionHeading
              eyebrow={t('home.testimonials.eyebrow')}
              title={t('home.testimonials.title')}
              description={t('home.testimonials.description')}
              align="center"
            />
          </Reveal>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {testimonials.map((item, index) => (
              <Reveal key={item.name} delay={index * 0.06}>
                <figure className="flex h-full flex-col rounded-2xl border border-sun-200/80 bg-cream/80 p-6">
                  <Quote className="h-6 w-6 text-flame-400" aria-hidden="true" />
                  <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-bamboo-800">
                    “{item.quote}”
                  </blockquote>
                  <figcaption className="mt-5 border-t border-sun-200 pt-4">
                    <p className="text-sm font-medium text-ink">{item.name}</p>
                    <p className="text-[11px] text-bamboo-600">{item.place}</p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-10 text-cream sm:px-10 sm:py-12">
            <div
              className="pointer-events-none absolute -right-20 -top-24 h-96 w-96 rounded-full bg-flame-500/25 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-sun-400/20 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-flame-300">
                  {t('home.countdown.eyebrow')}
                </p>
                <h2 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">
                  {countdown.isPast ? t('home.countdown.titlePast') : t('home.countdown.titleFuture')}
                </h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-sun-100/75">
                  {settings?.chhathDate
                    ? t('home.countdown.copyDate', {
                        date: formatDate(settings.chhathDate, {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        }),
                      })
                    : t('home.countdown.copyNoDate')}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button to="/shop" size="lg" variant="primary">
                    {t('home.countdown.cta')}
                  </Button>
                  <Button to="/shipping-returns" variant="ghost" className="text-sun-100 hover:bg-white/10">
                    {t('home.countdown.delivery')}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                <CountdownCell value={countdown.days} label={t('home.countdown.days')} />
                <CountdownCell value={countdown.hours} label={t('home.countdown.hours')} />
                <CountdownCell value={countdown.minutes} label={t('home.countdown.minutes')} />
                <CountdownCell value={countdown.seconds} label={t('home.countdown.seconds')} />
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="container-page pb-4">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-sun-200 bg-sun-50 px-6 py-10 sm:px-10">
            <div className="sun-rays pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
            <div className="relative grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
              <div>
                <p className="eyebrow">{t('home.newsletter.eyebrow')}</p>
                <h2 className="mt-2 font-display text-3xl text-ink">{t('home.newsletter.title')}</h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-bamboo-700">
                  {t('home.newsletter.copy')}
                </p>
              </div>
              <form onSubmit={onSubscribe} className="w-full">
                <label htmlFor="home-newsletter" className="sr-only">
                  {t('home.newsletter.label')}
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    id="home-newsletter"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={t('home.newsletter.placeholder')}
                    className="input-base flex-1"
                  />
                  <Button type="submit" className="shrink-0">
                    {t('home.newsletter.cta')}
                  </Button>
                </div>
                <p className="mt-2 text-[11px] text-bamboo-600">{t('home.newsletter.note')}</p>
              </form>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
