import { Star } from 'lucide-react';
import { cx } from '../../utils/format.js';

export default function StarRating({
  value = 0,
  count,
  size = 'sm',
  interactive = false,
  onChange,
  className,
}) {
  const starSize = size === 'lg' ? 'h-6 w-6' : size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';

  if (interactive) {
    return (
      <div className={cx('flex items-center gap-1', className)} role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star === 1 ? '' : 's'}`}
            onClick={() => onChange?.(star)}
            className="rounded p-0.5 transition hover:scale-110"
          >
            <Star
              className={cx(
                'h-7 w-7 transition',
                star <= value ? 'fill-flame-500 text-flame-500' : 'fill-transparent text-sun-400'
              )}
            />
          </button>
        ))}
      </div>
    );
  }

  return (
    <span className={cx('inline-flex items-center gap-1', className)}>
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cx(
              starSize,
              star <= Math.round(value) ? 'fill-flame-500 text-flame-500' : 'fill-transparent text-sun-300'
            )}
          />
        ))}
      </span>
      <span className="text-xs font-medium text-bamboo-700">
        {value ? value.toFixed(1) : 'New'}
        {typeof count === 'number' && count > 0 && (
          <span className="font-normal text-bamboo-600/80"> ({count})</span>
        )}
      </span>
      <span className="sr-only">
        {value ? `Rated ${value} out of 5` : 'Not rated yet'}
        {count ? ` from ${count} reviews` : ''}
      </span>
    </span>
  );
}
