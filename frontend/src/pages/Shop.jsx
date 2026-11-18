import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowRight, Search, X } from 'lucide-react';
import Seo from '../components/seo/Seo.jsx';
import Filters from '../components/product/Filters.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import Button from '../components/ui/Button.jsx';
import { fetchCategories, fetchProducts } from '../services/catalog.service.js';
import { useT } from '../i18n/useT.js';
import { useCatalogText } from '../i18n/useCatalogText.js';
import { SORT_OPTIONS, CHHATH_DAYS, FABRICS, COLORS } from '../utils/constants.js';

const LIMIT = 12;

const readFilters = (params) => ({
  q: params.get('q') || '',
  category: params.get('category') || '',
  fabric: params.get('fabric') || '',
  color: params.get('color') || '',
  day: params.get('day') || '',
  minPrice: params.get('minPrice') || '',
  maxPrice: params.get('maxPrice') || '',
  rating: params.get('rating') || '',
  sort: params.get('sort') || 'featured',
  page: Math.max(1, Number(params.get('page')) || 1),
});

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, lang } = useT();
  const { fabricLabel, colorLabel, dayLabel } = useCatalogText();
  const queryString = searchParams.toString();
  const filters = useMemo(() => readFilters(new URLSearchParams(queryString)), [queryString]);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [term, setTerm] = useState(filters.q);

  useEffect(() => {
    setTerm(filters.q);
  }, [filters.q]);

  useEffect(() => {
    let cancelled = false;
    fetchCategories()
      .then((result) => {
        if (!cancelled) setCategories(result);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    fetchProducts({
      q: filters.q || undefined,
      category: filters.category || undefined,
      fabric: filters.fabric || undefined,
      color: filters.color || undefined,
      day: filters.day || undefined,
      minPrice: filters.minPrice || undefined,
      maxPrice: filters.maxPrice || undefined,
      rating: filters.rating || undefined,
      sort: filters.sort,
      page: filters.page,
      limit: LIMIT,
    })
      .then((result) => {
        if (cancelled) return;
        setProducts(result.products);
        setPages(result.pages);
        setTotal(result.total);
      })
      .catch((requestError) => {
        if (!cancelled) {
          setProducts([]);
          setPages(0);
          setTotal(0);
          setError(requestError.message || 'fallback');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters, queryString]);

  const applyParams = (mutate) => {
    const next = new URLSearchParams(searchParams);
    mutate(next);
    setSearchParams(next);
  };

  const onToggle = (key, value) => {
    applyParams((next) => {
      next.delete('page');
      if (key === 'price') {
        if (!value) {
          next.delete('minPrice');
          next.delete('maxPrice');
          return;
        }
        if (value.minPrice) next.set('minPrice', value.minPrice);
        else next.delete('minPrice');
        if (value.maxPrice) next.set('maxPrice', value.maxPrice);
        else next.delete('maxPrice');
        return;
      }
      const current = next.get(key);
      if (current === value) next.delete(key);
      else next.set(key, value);
    });
  };

  const onClear = () => {
    setSearchParams(new URLSearchParams());
  };

  const onSearch = (event) => {
    event.preventDefault();
    applyParams((next) => {
      next.delete('page');
      if (term.trim()) next.set('q', term.trim());
      else next.delete('q');
    });
  };

  const onSort = (event) => {
    applyParams((next) => {
      next.delete('page');
      if (event.target.value === 'featured') next.delete('sort');
      else next.set('sort', event.target.value);
    });
  };

  const onPage = (page) => {
    applyParams((next) => {
      if (page <= 1) next.delete('page');
      else next.set('page', String(page));
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeChips = [
    filters.q && { key: 'q', label: `“${filters.q}”` },
    filters.category && {
      key: 'category',
      label: (() => {
        const found = categories.find((category) => category.slug === filters.category);
        return (found && (lang === 'hi' ? found.nameHi || found.name : found.name)) || filters.category;
      })(),
    },
    filters.fabric && { key: 'fabric', label: fabricLabel(filters.fabric) },
    filters.color && { key: 'color', label: colorLabel(filters.color) },
    filters.day && { key: 'day', label: dayLabel(filters.day) },
    filters.rating && { key: 'rating', label: t('shop.ratingAbove', { rating: filters.rating }) },
    (filters.minPrice || filters.maxPrice) && {
      key: 'price',
      label: t('shop.priceRange', { min: filters.minPrice || 0, max: filters.maxPrice || '∞' }),
    },
  ].filter(Boolean);

  const removeChip = (key) => {
    if (key === 'price') onToggle('price', null);
    else onToggle(key, filters[key]);
  };

  return (
    <>
      <Seo
        title={t('shop.seoTitle')}
        description={t('shop.seoDescription')}
        path="/shop"
      />

      <div className="border-b border-sun-200/70 bg-sun-50/60">
        <div className="container-page py-8 sm:py-10">
          <nav aria-label="Breadcrumb" className="text-[11px] text-bamboo-600">
            <span>{t('shop.breadcrumbHome')}</span>
            <span className="mx-1.5" aria-hidden="true">/</span>
            <span className="font-medium text-bamboo-800">{t('shop.breadcrumbShop')}</span>
          </nav>
          <h1 className="mt-3 font-display text-3xl text-ink sm:text-4xl">
            {filters.day ? t('shop.titleDay', { day: dayLabel(filters.day) }) : t('shop.titleAll')}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-bamboo-700">
            {(() => {
              const day = CHHATH_DAYS.find((entry) => entry.name === filters.day);
              if (day) return lang === 'hi' ? day.blurbHi || day.blurb : day.blurb;
              return t('shop.descriptionAll');
            })()}
          </p>
        </div>
      </div>

      <div className="container-page py-8">
        <div className="grid gap-8 lg:grid-cols-[236px_1fr]">
          <div>
            <Filters
              categories={categories}
              filters={filters}
              onToggle={onToggle}
              onClear={onClear}
              resultCount={loading ? null : total}
            />
          </div>

          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <form onSubmit={onSearch} className="relative w-full sm:max-w-xs" role="search">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bamboo-600"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={term}
                  onChange={(event) => setTerm(event.target.value)}
                  placeholder={t('shop.searchPlaceholder')}
                  className="input-base pl-9 pr-9"
                  aria-label={t('shop.searchAria')}
                />
                {term && (
                  <button
                    type="button"
                    onClick={() => {
                      setTerm('');
                      applyParams((next) => next.delete('q'));
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-bamboo-600 hover:text-sindoor-700"
                    aria-label={t('shop.clearSearch')}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </form>

              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <p className="text-xs text-bamboo-600">
                  {loading ? t('shop.loading') : t(total === 1 ? 'shop.countOne' : 'shop.countMany', { count: total })}
                </p>
                <label className="flex items-center gap-2 text-xs text-bamboo-700">
                  <span className="hidden sm:inline">{t('shop.sort')}</span>
                  <select
                    value={filters.sort}
                    onChange={onSort}
                    className="rounded-full border border-sun-300 bg-white px-3 py-2 text-xs text-bamboo-800 focus:border-flame-500 focus:outline-none"
                    aria-label={t('shop.sortAria')}
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {lang === 'hi' ? option.labelHi || option.label : option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {activeChips.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {activeChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => removeChip(chip.key)}
                    className="inline-flex items-center gap-1 rounded-full border border-sun-300 bg-white px-2.5 py-1 text-[11px] text-bamboo-800 transition hover:border-flame-400 hover:text-sindoor-700"
                  >
                    {chip.label}
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={onClear}
                  className="text-[11px] font-medium text-sindoor-700 hover:underline"
                >
                  {t('shop.clearAll')}
                </button>
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error === 'fallback' ? t('shop.errorLoad') : error}
              </div>
            )}

            <div className="mt-5">
              <ProductGrid
                products={products}
                loading={loading}
                skeletonCount={LIMIT}
                emptyTitle={t('shop.emptyTitle')}
                emptyDescription={t('shop.emptyDescription')}
                emptyAction={
                  <Button variant="outline" onClick={onClear}>
                    {t('shop.clearFilters')}
                  </Button>
                }
              />
            </div>

            <Pagination page={filters.page} pages={pages} onChange={onPage} className="mt-10" />

            {!loading && products.length > 0 && filters.page === pages && pages > 1 && (
              <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-bamboo-600">
                {t('shop.seenAll', { count: total })}
                <button
                  type="button"
                  onClick={onClear}
                  className="inline-flex items-center gap-1 font-medium text-sindoor-700 hover:underline"
                >
                  {t('shop.startOver')}
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="container-page pb-6">
        <p className="text-[11px] leading-relaxed text-bamboo-600/80">
          {t('shop.availableWeaves')}: {FABRICS.map((fabric) => fabricLabel(fabric.name)).join(' · ')}.{' '}
          {t('shop.colours')}: {COLORS.map((color) => colorLabel(color.name)).join(' · ')}.
        </p>
      </div>
    </>
  );
}
