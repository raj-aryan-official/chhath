import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import Drawer from '../ui/Drawer.jsx';
import Button from '../ui/Button.jsx';
import { CHHATH_DAYS, COLORS, FABRICS, PRICE_BANDS } from '../../utils/constants.js';
import { cx } from '../../utils/format.js';
import { useT } from '../../i18n/useT.js';
import { useCatalogText } from '../../i18n/useCatalogText.js';

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-sun-200/80 py-4 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={open}
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-bamboo-800">
          {title}
        </span>
        <ChevronDown
          className={cx('h-4 w-4 text-bamboo-600 transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OptionButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        'rounded-full border px-3 py-1.5 text-xs font-medium transition',
        active
          ? 'border-flame-600 bg-flame-600 text-white'
          : 'border-sun-300 bg-white text-bamboo-800 hover:border-flame-400 hover:text-sindoor-700'
      )}
    >
      {children}
    </button>
  );
}

function FilterBody({ categories, filters, onToggle, onClear, resultCount }) {
  const { t, lang } = useT();
  const { fabricLabel, dayLabel, colorLabel } = useCatalogText();
  const priceBand = PRICE_BANDS.findIndex(
    (band) =>
      String(band.min ?? '') === String(filters.minPrice ?? '') &&
      String(band.max ?? '') === String(filters.maxPrice ?? '')
  );

  return (
    <div>
      <div className="flex items-center justify-between pb-2">
        <p className="text-xs text-bamboo-600">
          {resultCount === null ? t('shop.filters.finding') : t('shop.filters.sareesCount', { count: resultCount })}
        </p>
        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-1 text-xs font-medium text-sindoor-700 hover:underline"
        >
          <X className="h-3 w-3" aria-hidden="true" />
          {t('shop.clearAll')}
        </button>
      </div>

      <Section title={t('shop.filters.collection')}>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <OptionButton
              key={category._id}
              active={filters.category === category.slug}
              onClick={() => onToggle('category', category.slug)}
            >
              {lang === 'hi' ? category.nameHi || category.name : category.name}
              {typeof category.productCount === 'number' && (
                <span className="ml-1.5 opacity-65">{category.productCount}</span>
              )}
            </OptionButton>
          ))}
        </div>
      </Section>

      <Section title={t('shop.filters.day')}>
        <div className="flex flex-wrap gap-2">
          {CHHATH_DAYS.map((day) => (
            <OptionButton
              key={day.name}
              active={filters.day === day.name}
              onClick={() => onToggle('day', day.name)}
            >
              {dayLabel(day.name)}
            </OptionButton>
          ))}
        </div>
      </Section>

      <Section title={t('shop.filters.fabric')}>
        <div className="flex flex-wrap gap-2">
          {FABRICS.map((fabric) => (
            <OptionButton
              key={fabric.name}
              active={filters.fabric === fabric.name}
              onClick={() => onToggle('fabric', fabric.name)}
            >
              {fabricLabel(fabric.name)}
            </OptionButton>
          ))}
        </div>
      </Section>

      <Section title={t('shop.filters.colour')}>
        <div className="flex flex-wrap gap-2.5">
          {COLORS.map((color) => {
            const active = filters.color === color.name;
            return (
              <button
                key={color.name}
                type="button"
                onClick={() => onToggle('color', color.name)}
                aria-pressed={active}
                aria-label={colorLabel(color.name)}
                title={colorLabel(color.name)}
                className={cx(
                  'flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-2.5 text-[11px] transition',
                  active
                    ? 'border-flame-600 bg-flame-50 text-sindoor-700'
                    : 'border-sun-300 bg-white text-bamboo-700 hover:border-flame-400'
                )}
              >
                <span
                  className={cx(
                    'h-4 w-4 rounded-full ring-1 ring-ink/10',
                    active && 'ring-2 ring-flame-500'
                  )}
                  style={{ backgroundColor: color.hex }}
                  aria-hidden="true"
                />
                {colorLabel(color.name)}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title={t('shop.filters.price')}>
        <div className="flex flex-col gap-1.5">
          {PRICE_BANDS.map((band, index) => (
            <button
              key={band.label}
              type="button"
              onClick={() =>
                onToggle(
                  'price',
                  priceBand === index
                    ? null
                    : { minPrice: band.min, maxPrice: band.max }
                )
              }
              aria-pressed={priceBand === index}
              className={cx(
                'flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm transition',
                priceBand === index
                  ? 'bg-flame-50 font-medium text-sindoor-700'
                  : 'text-bamboo-800 hover:bg-sun-100'
              )}
            >
              <span
                className={cx(
                  'flex h-3.5 w-3.5 items-center justify-center rounded-full border',
                  priceBand === index ? 'border-flame-600' : 'border-sun-400'
                )}
                aria-hidden="true"
              >
                {priceBand === index && <span className="h-1.5 w-1.5 rounded-full bg-flame-600" />}
              </span>
              {lang === 'hi' ? band.labelHi || band.label : band.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title={t('shop.filters.rating')} defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {[4, 3].map((rating) => (
            <OptionButton
              key={rating}
              active={filters.rating === String(rating)}
              onClick={() => onToggle('rating', String(rating))}
            >
              {t('shop.filters.above', { rating })}
            </OptionButton>
          ))}
        </div>
      </Section>
    </div>
  );
}

export default function Filters({
  categories,
  filters,
  onToggle,
  onClear,
  resultCount,
}) {
  const { t } = useT();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeCount = ['category', 'day', 'fabric', 'color', 'rating'].filter(
    (key) => filters[key]
  ).length + (filters.minPrice || filters.maxPrice ? 1 : 0);

  return (
    <>
      <aside className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-sun-200/80 bg-white/70 p-5 backdrop-blur-sm lg:block">
        <div className="flex items-center gap-2 pb-2">
          <SlidersHorizontal className="h-4 w-4 text-sindoor-700" aria-hidden="true" />
          <h2 className="font-display text-lg text-ink">{t('shop.filters.refine')}</h2>
        </div>
        <FilterBody
          categories={categories}
          filters={filters}
          onToggle={onToggle}
          onClear={onClear}
          resultCount={resultCount}
        />
      </aside>

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="flex items-center gap-2 rounded-full border border-sun-300 bg-white px-4 py-2.5 text-sm font-medium text-bamboo-800 transition hover:border-flame-400 lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        {t('shop.filters.open')}
        {activeCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-sindoor-600 px-1.5 text-[10px] font-semibold text-white">
            {activeCount}
          </span>
        )}
      </button>

      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} side="left" title={t('shop.filters.refine')}>
        <FilterBody
          categories={categories}
          filters={filters}
          onToggle={onToggle}
          onClear={onClear}
          resultCount={resultCount}
        />
        <div className="sticky bottom-0 mt-4 bg-cream pt-3">
          <Button className="w-full" onClick={() => setMobileOpen(false)}>
            {t('shop.filters.show', { count: resultCount === null ? '' : resultCount })}
          </Button>
        </div>
      </Drawer>
    </>
  );
}
