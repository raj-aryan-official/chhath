import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingBag } from 'lucide-react';
import LazyImage from '../ui/LazyImage.jsx';
import StarRating from '../ui/StarRating.jsx';
import { toggleWishlist } from '../../store/slices/wishlistSlice.js';
import { toast } from '../../store/index.js';
import { formatINR, cx } from '../../utils/format.js';
import { useT } from '../../i18n/useT.js';
import { useLocalized } from '../../i18n/useLocalized.js';
import { useCatalogText } from '../../i18n/useCatalogText.js';

export default function ProductCard({ product, priority = false, className }) {
  const dispatch = useDispatch();
  const { t } = useT();
  const { pick } = useLocalized();
  const { fabricLabel, dayLabel, colorLabel } = useCatalogText();
  const wishlist = useSelector((state) => state.wishlist.products);
  const saved = wishlist.some((item) => item._id === product._id);
  const name = pick(product, 'name');

  const discount =
    product.discountPercent ??
    (product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0);

  const soldOut = product.stock === 0;

  const onToggleWishlist = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      const result = await dispatch(toggleWishlist(product)).unwrap();
      toast.success(result.removedId ? t('product.removedToast') : t('product.savedToast'));
    } catch (error) {
      toast.info(error || t('product.wishlistSignIn'));
    }
  };

  return (
    <article
      className={cx(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-sun-200/70 bg-white/85 shadow-[0_10px_30px_-18px_rgba(234,88,12,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:border-flame-300 hover:shadow-warm',
        className
      )}
    >
      <div className="relative">
        <Link
          to={`/product/${product.slug}`}
          className="block"
          aria-label={t('productCard.view', { name })}
        >
          <LazyImage
            src={product.images?.[0]}
            alt={name}
            aspect="3 / 4"
            width={600}
            height={800}
            eager={priority}
            className="transition-transform duration-700 group-hover:scale-[1.04]"
            wrapperClassName="bg-sun-100"
          />
          <span
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            aria-hidden="true"
          />
          <span className="pointer-events-none absolute inset-x-3 bottom-3 flex translate-y-2 items-center justify-center gap-1.5 rounded-full bg-cream/95 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-bamboo-800 opacity-0 shadow-soft transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
            {t('productCard.viewSaree')}
          </span>
        </Link>

        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {discount > 0 && (
            <span className="rounded-full bg-sindoor-700 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-soft">
              {t('productCard.off', { percent: discount })}
            </span>
          )}
          {soldOut && (
            <span className="rounded-full bg-ink/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cream">
              {t('actions.soldOut')}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleWishlist}
          aria-pressed={saved}
          aria-label={
            saved
              ? t('productCard.removeFromWishlistNamed', { name })
              : t('productCard.saveToWishlistNamed', { name })
          }
          className={cx(
            'absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border shadow-soft backdrop-blur transition',
            saved
              ? 'border-sindoor-600 bg-sindoor-600 text-white'
              : 'border-sun-200 bg-cream/90 text-bamboo-800 hover:border-flame-400 hover:text-sindoor-700'
          )}
        >
          <Heart className={cx('h-4 w-4', saved && 'fill-current')} aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-flame-700">
          {fabricLabel(product.fabric)}
          {product.day && product.day !== 'All Days' ? ` · ${dayLabel(product.day)}` : ''}
        </p>
        <h3 className="mt-1.5 font-display text-[17px] leading-snug text-ink">
          <Link to={`/product/${product.slug}`} className="transition hover:text-sindoor-700">
            {name}
          </Link>
        </h3>

        <div className="mt-2 flex items-center gap-2">
          <StarRating value={product.ratingsAverage || 0} count={product.ratingsCount} />
          {product.color?.name && (
            <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-bamboo-600">
              <span
                className="h-2.5 w-2.5 rounded-full ring-1 ring-ink/10"
                style={{ backgroundColor: product.color.hex }}
                aria-hidden="true"
              />
              {colorLabel(product.color.name)}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="text-[15px] font-semibold text-ink">{formatINR(product.price)}</span>
          {product.mrp > product.price && (
            <span className="text-xs text-bamboo-600 line-through">{formatINR(product.mrp)}</span>
          )}
        </div>
      </div>
    </article>
  );
}
