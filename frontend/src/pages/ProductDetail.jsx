import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ChevronDown,
  Heart,
  MapPin,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from 'lucide-react';
import Seo from '../components/seo/Seo.jsx';
import Gallery from '../components/product/Gallery.jsx';
import SizeColorPicker from '../components/product/SizeColorPicker.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import StarRating from '../components/ui/StarRating.jsx';
import QuantityStepper from '../components/ui/QuantityStepper.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { ProductDetailSkeleton } from '../components/ui/Skeleton.jsx';
import Reveal from '../components/ui/Reveal.jsx';
import DiyaDivider from '../components/brand/DiyaDivider.jsx';
import {
  fetchProductBySlug,
  fetchRelatedProducts,
} from '../services/catalog.service.js';
import { createReview, fetchReviews } from '../services/review.service.js';
import { addItem } from '../store/slices/cartSlice.js';
import { toggleWishlist } from '../store/slices/wishlistSlice.js';
import { openCart } from '../store/slices/uiSlice.js';
import { toast } from '../store/index.js';
import { formatDate, formatINR, cx } from '../utils/format.js';
import { useT } from '../i18n/useT.js';
import { useLocalized } from '../i18n/useLocalized.js';
import { useCatalogText } from '../i18n/useCatalogText.js';

function DetailRow({ icon: Icon, title, children }) {
  return (
    <div className="flex gap-3 rounded-xl bg-sun-50/80 p-3.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-flame-700" aria-hidden="true" />
      <div>
        <p className="text-xs font-semibold text-ink">{title}</p>
        <div className="mt-0.5 text-[11px] leading-relaxed text-bamboo-700">{children}</div>
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { t } = useT();
  const { pick } = useLocalized();
  const { fabricLabel, dayLabel, colorLabel } = useCatalogText();
  const user = useSelector((state) => state.auth.user);
  const saved = useSelector((state) =>
    state.wishlist.products.some((item) => item.slug === slug)
  );

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [pincode, setPincode] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [reviewSaving, setReviewSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    setProduct(null);
    setReviews([]);
    setReviewTotal(0);
    setQty(1);

    fetchProductBySlug(slug)
      .then((result) => {
        if (cancelled) return;
        setProduct(result);
        setSize(result.sizes?.[0]?.label || 'Free Size');

        fetchReviews(result._id, { page: 1, limit: 6 })
          .then((reviewResult) => {
            if (cancelled) return;
            setReviews(reviewResult.reviews);
            setReviewTotal(reviewResult.total);
          })
          .catch(() => {});

        fetchRelatedProducts(slug)
          .then((relatedResult) => {
            if (!cancelled) setRelated(relatedResult);
          })
          .catch(() => {});
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message || 'fallback');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const selectedSize = useMemo(
    () => product?.sizes?.find((option) => option.label === size),
    [product, size]
  );

  const unitPrice = (product?.price || 0) + (selectedSize?.priceDelta || 0);
  const discount =
    product && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;
  const soldOut = product ? product.stock === 0 : false;
  const maxQty = Math.min(10, product?.stock || 1);

  const addToBag = async () => {
    if (!product || soldOut) return;
    setAdding(true);
    try {
      await dispatch(addItem({ product, size, qty })).unwrap();
      toast.success(t('product.addedToast'));
      dispatch(openCart());
    } catch (requestError) {
      toast.error(requestError?.message || t('product.addError'));
    } finally {
      setAdding(false);
    }
  };

  const saveToWishlist = async () => {
    try {
      const result = await dispatch(toggleWishlist(product)).unwrap();
      toast.success(result.removedId ? t('product.removedToast') : t('product.savedToast'));
    } catch (requestError) {
      toast.info(requestError || t('product.wishlistSignIn'));
    }
  };

  const checkPincode = (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(pincode)) {
      setDeliveryNote(t('product.pincodeInvalid'));
      return;
    }
    // TODO: connect a pincode serviceability API. This is a friendly estimate only.
    setDeliveryNote(t('product.pincodeEstimate', { pincode }));
  };

  const submitReview = async (event) => {
    event.preventDefault();
    if (!reviewForm.comment.trim()) {
      toast.error(t('product.reviewEmpty'));
      return;
    }
    setReviewSaving(true);
    try {
      const review = await createReview(product._id, {
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
      });
      setReviews((current) => [review, ...current]);
      setReviewTotal((count) => count + 1);
      setReviewForm({ rating: 5, title: '', comment: '' });
      toast.success(t('product.reviewThanks'));
    } catch (requestError) {
      toast.error(requestError.message || t('product.reviewSaveError'));
    } finally {
      setReviewSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container-page py-10">
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-page py-16">
        <Seo title={t('product.notFoundTitle')} noIndex path={`/product/${slug}`} />
        <EmptyState
          icon={ShoppingBag}
          title={t('product.notFoundTitle')}
          description={error === 'fallback' ? t('product.notFoundError') : error || t('product.notFoundDescription')}
          action={<Button to="/shop">{t('product.backToCollection')}</Button>}
        />
      </div>
    );
  }

  const displayName = pick(product, 'name');
  const displayShort = pick(product, 'shortDescription');
  const displayDescription = pick(product, 'description');
  const displayCare = pick(product, 'care');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: displayName,
    image: product.images,
    description: displayDescription,
    sku: product._id,
    brand: { '@type': 'Brand', name: 'KHARNA' },
    material: product.fabric,
    color: colorLabel(product.color?.name),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product.price,
      availability: soldOut ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      url: `https://kharna.in/product/${product.slug}`,
    },
    ...(product.ratingsCount
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.ratingsAverage,
            reviewCount: product.ratingsCount,
          },
        }
      : {}),
  };

  return (
    <>
      <Seo
        title={displayName}
        description={displayShort || displayDescription.slice(0, 160)}
        image={product.images?.[0]}
        type="product"
        path={`/product/${product.slug}`}
        jsonLd={jsonLd}
      />

      <div className="container-page py-8 pb-28 lg:pb-12">
        <nav aria-label="Breadcrumb" className="mb-6 text-[11px] text-bamboo-600">
          <Link to="/" className="hover:text-sindoor-700">
            {t('product.breadcrumbHome')}
          </Link>
          <span className="mx-1.5" aria-hidden="true">/</span>
          <Link to="/shop" className="hover:text-sindoor-700">
            {t('product.breadcrumbShop')}
          </Link>
          <span className="mx-1.5" aria-hidden="true">/</span>
          <span className="font-medium text-bamboo-800">{displayName}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <Gallery images={product.images} name={displayName} />

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-flame-700">
              {fabricLabel(product.fabric)}
              {product.day && product.day !== 'All Days' ? ` · ${dayLabel(product.day)}` : ''}
            </p>
            <h1 className="mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl">
              {displayName}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <StarRating value={product.ratingsAverage || 0} count={product.ratingsCount} size="md" />
              <a href="#reviews" className="text-xs text-sindoor-700 hover:underline">
                {reviewTotal > 0
                  ? t('product.reviewsRead', { count: reviewTotal })
                  : t('product.firstReview')}
              </a>
            </div>

            {displayShort && (
              <p className="mt-4 text-sm leading-relaxed text-bamboo-700">{displayShort}</p>
            )}

            <div className="mt-5 flex flex-wrap items-baseline gap-2.5">
              <span className="font-display text-3xl text-ink">{formatINR(unitPrice)}</span>
              {product.mrp > product.price && (
                <>
                  <span className="text-sm text-bamboo-600 line-through">{formatINR(product.mrp)}</span>
                  <span className="rounded-full bg-sindoor-700/10 px-2.5 py-1 text-[11px] font-semibold text-sindoor-700">
                    {t('product.savePercent', { percent: discount })}
                  </span>
                </>
              )}
            </div>
            <p className="mt-1 text-[11px] text-bamboo-600">{t('product.taxNote')}</p>

            <div className="mt-6">
              <SizeColorPicker product={product} size={size} onSizeChange={setSize} />
            </div>

            <div className="mt-6 flex items-center gap-3 text-sm">
              <span
                className={cx(
                  'inline-flex items-center gap-1.5 font-medium',
                  soldOut ? 'text-red-700' : product.stock <= 5 ? 'text-flame-700' : 'text-emerald-700'
                )}
              >
                <span
                  className={cx(
                    'h-2 w-2 rounded-full',
                    soldOut ? 'bg-red-600' : product.stock <= 5 ? 'bg-flame-500' : 'bg-emerald-600'
                  )}
                  aria-hidden="true"
                />
                {soldOut
                  ? t('product.stockSoldOut')
                  : product.stock <= 5
                    ? t('product.stockFew', { count: product.stock })
                    : t('product.stockIn')}
              </span>
              <span className="text-bamboo-600">·</span>
              <span className="text-xs text-bamboo-600">{t('product.dispatched')}</span>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <QuantityStepper
                value={qty}
                max={maxQty}
                onChange={setQty}
                disabled={soldOut}
                label={t('product.quantityLabel', { name: displayName })}
              />
              <Button
                size="lg"
                onClick={addToBag}
                loading={adding}
                disabled={soldOut}
                className="flex-1"
              >
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                {soldOut ? t('product.soldOut') : t('product.addToBag')}
              </Button>
              <button
                type="button"
                onClick={saveToWishlist}
                aria-pressed={saved}
                aria-label={saved ? t('product.removeFromWishlist') : t('product.saveToWishlist')}
                className={cx(
                  'flex h-12 w-12 shrink-0 items-center justify-center self-start rounded-full border transition sm:self-auto',
                  saved
                    ? 'border-sindoor-600 bg-sindoor-600 text-white'
                    : 'border-sun-300 bg-white text-bamboo-800 hover:border-flame-500 hover:text-sindoor-700'
                )}
              >
                <Heart className={cx('h-5 w-5', saved && 'fill-current')} />
              </button>
            </div>

            <form onSubmit={checkPincode} className="mt-5 rounded-2xl border border-sun-200 bg-white/70 p-4">
              <label htmlFor="pincode" className="text-[11px] font-semibold uppercase tracking-[0.2em] text-bamboo-700">
                {t('product.checkDelivery')}
              </label>
              <div className="mt-2 flex gap-2">
                <div className="relative flex-1">
                  <MapPin
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bamboo-500"
                    aria-hidden="true"
                  />
                  <input
                    id="pincode"
                    inputMode="numeric"
                    maxLength={6}
                    value={pincode}
                    onChange={(event) => {
                      setPincode(event.target.value.replace(/\D/g, ''));
                      setDeliveryNote('');
                    }}
                    placeholder={t('product.pincodePlaceholder')}
                    className="input-base pl-9"
                  />
                </div>
                <Button type="submit" variant="secondary">
                  {t('product.check')}
                </Button>
              </div>
              {deliveryNote && (
                <p className="mt-2 text-xs leading-relaxed text-bamboo-700" role="status">
                  {deliveryNote}
                </p>
              )}
            </form>

            <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
              <DetailRow icon={Sparkles} title={t('product.details.weaveTitle')}>
                {fabricLabel(product.fabric)}{' '}
                {t('product.details.in')}{' '}
                {product.color?.name ? colorLabel(product.color.name).toLowerCase() : t('product.details.festiveTones')} ·{' '}
                {product.day ? dayLabel(product.day) : t('product.details.allDays')}
              </DetailRow>
              <DetailRow icon={Truck} title={t('product.details.deliveryTitle')}>
                {t('product.details.freeAbove')}
              </DetailRow>
              <DetailRow icon={RotateCcw} title={t('product.details.returnsTitle')}>
                {t('product.details.returnsCopy')}
              </DetailRow>
              <DetailRow icon={ShieldCheck} title={t('product.details.blouseTitle')}>
                {product.blouse?.included
                  ? product.blouse.details || t('product.details.included')
                  : t('product.details.notIncluded')}
              </DetailRow>
            </div>

            <div className="mt-6 space-y-2">
              <details className="group rounded-xl border border-sun-200 bg-white/70 px-4 py-3" open>
                <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-ink">
                  {t('product.aboutTitle')}
                  <ChevronDown className="h-4 w-4 text-bamboo-600 transition group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-bamboo-700">{displayDescription}</p>
                {product.tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {product.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-sun-100 px-2.5 py-1 text-[10px] text-bamboo-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </details>
              <details className="group rounded-xl border border-sun-200 bg-white/70 px-4 py-3">
                <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-ink">
                  {t('product.careTitle')}
                  <ChevronDown className="h-4 w-4 text-bamboo-600 transition group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-bamboo-700">
                  {displayCare || t('product.defaultCare')}
                </p>
              </details>
              <details className="group rounded-xl border border-sun-200 bg-white/70 px-4 py-3">
                <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-ink">
                  {t('product.dayTitle')}
                  <ChevronDown className="h-4 w-4 text-bamboo-600 transition group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-bamboo-700">
                  {t(`product.dayDescriptions.${product.day}`) !== `product.dayDescriptions.${product.day}`
                    ? t(`product.dayDescriptions.${product.day}`)
                    : t('product.dayFallback')}
                </p>
              </details>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <DiyaDivider />
        </div>

        <section id="reviews" className="mt-12 scroll-mt-28">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="eyebrow">{t('product.reviewsEyebrow')}</p>
              <h2 className="mt-2 font-display text-3xl text-ink">{t('product.reviewsTitle')}</h2>
              <div className="mt-3 flex items-center gap-3">
                <StarRating value={product.ratingsAverage || 0} count={product.ratingsCount} size="md" />
                <span className="text-xs text-bamboo-600">
                  {reviewTotal ? t('product.verifiedNotes', { count: reviewTotal }) : t('product.noReviews')}
                </span>
              </div>

              {user ? (
                <form onSubmit={submitReview} className="mt-5 space-y-3 rounded-2xl border border-sun-200 bg-white/80 p-5">
                  <p className="text-sm font-medium text-ink">{t('product.writeReview')}</p>
                  <StarRating
                    interactive
                    value={reviewForm.rating}
                    onChange={(rating) => setReviewForm((form) => ({ ...form, rating }))}
                  />
                  <div>
                    <label htmlFor="review-title" className="label-base">
                      {t('product.reviewTitleLabel')}
                    </label>
                    <input
                      id="review-title"
                      value={reviewForm.title}
                      onChange={(event) =>
                        setReviewForm((form) => ({ ...form, title: event.target.value }))
                      }
                      maxLength={100}
                      className="input-base"
                      placeholder={t('product.reviewTitlePlaceholder')}
                    />
                  </div>
                  <div>
                    <label htmlFor="review-comment" className="label-base">
                      {t('product.reviewCommentLabel')}
                    </label>
                    <textarea
                      id="review-comment"
                      value={reviewForm.comment}
                      onChange={(event) =>
                        setReviewForm((form) => ({ ...form, comment: event.target.value }))
                      }
                      rows={4}
                      maxLength={1000}
                      required
                      className="input-base resize-y"
                      placeholder={t('product.reviewCommentPlaceholder')}
                    />
                  </div>
                  <Button type="submit" loading={reviewSaving}>
                    {t('product.postReview')}
                  </Button>
                </form>
              ) : (
                <div className="mt-5 rounded-2xl border border-sun-200 bg-sun-50 p-5 text-sm text-bamboo-700">
                  <p>{t('product.signInToReview')}</p>
                  <Button
                    to="/login"
                    variant="outline"
                    className="mt-3"
                    state={{ from: `/product/${product.slug}` }}
                  >
                    {t('product.signIn')}
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {reviews.length === 0 && (
                <p className="rounded-2xl border border-dashed border-sun-300 bg-white/60 p-6 text-sm text-bamboo-700">
                  {t('product.noReviewsBody')}
                </p>
              )}
              {reviews.map((review) => (
                <article key={review._id} className="rounded-2xl border border-sun-200/80 bg-white/80 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-ink">{review.name}</p>
                      <p className="text-[11px] text-bamboo-600">{formatDate(review.createdAt)}</p>
                    </div>
                    <StarRating value={review.rating} />
                  </div>
                  {pick(review, 'title') && (
                    <p className="mt-3 font-display text-lg text-ink">{pick(review, 'title')}</p>
                  )}
                  <p className="mt-2 text-sm leading-relaxed text-bamboo-700">{pick(review, 'comment')}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-16">
            <Reveal>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="eyebrow">{t('product.moreEyebrow')}</p>
                  <h2 className="mt-2 font-display text-3xl text-ink">{t('product.moreTitle')}</h2>
                </div>
                <Link to="/shop" className="text-xs font-medium text-sindoor-700 hover:underline">
                  {t('product.viewAll')}
                </Link>
              </div>
            </Reveal>
            <div className="mt-6">
              <ProductGrid products={related} columns="grid-cols-2 gap-4 md:grid-cols-4" />
            </div>
          </section>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-sun-200 bg-cream/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">{formatINR(unitPrice)}</p>
            <p className="truncate text-[10px] text-bamboo-600">{displayName}</p>
          </div>
          <Button onClick={addToBag} loading={adding} disabled={soldOut} className="ml-auto flex-1">
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            {soldOut ? t('product.soldOut') : t('product.addToBag')}
          </Button>
        </div>
      </div>
    </>
  );
}
