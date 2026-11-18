import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cx } from '../../utils/format.js';

export default function Pagination({ page, pages, onChange, className }) {
  if (!pages || pages <= 1) return null;

  const numbers = Array.from({ length: pages }, (_, index) => index + 1).filter(
    (number) => number === 1 || number === pages || Math.abs(number - page) <= 1
  );

  return (
    <nav className={cx('flex flex-wrap items-center justify-center gap-1.5', className)} aria-label="Pagination">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-sun-300 bg-white text-bamboo-800 transition hover:border-flame-500 disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {numbers.map((number, index) => {
        const previous = numbers[index - 1];
        const hasGap = previous && number - previous > 1;
        return (
          <span key={number} className="flex items-center gap-1.5">
            {hasGap && <span className="px-1 text-bamboo-600">…</span>}
            <button
              type="button"
              onClick={() => onChange(number)}
              aria-current={number === page ? 'page' : undefined}
              className={cx(
                'h-9 min-w-9 rounded-full border px-2 text-sm font-medium transition',
                number === page
                  ? 'border-flame-600 bg-flame-600 text-white'
                  : 'border-sun-300 bg-white text-bamboo-800 hover:border-flame-500'
              )}
            >
              {number}
            </button>
          </span>
        );
      })}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-sun-300 bg-white text-bamboo-800 transition hover:border-flame-500 disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
