import { Minus, Plus } from 'lucide-react';
import { cx } from '../../utils/format.js';

export default function QuantityStepper({
  value = 1,
  min = 1,
  max = 10,
  onChange,
  disabled = false,
  size = 'md',
  label = 'Quantity',
}) {
  const buttonClass =
    size === 'sm'
      ? 'h-7 w-7'
      : 'h-10 w-10';

  return (
    <div
      className={cx(
        'inline-flex items-center rounded-full border border-sun-300 bg-white',
        disabled && 'opacity-60'
      )}
    >
      <button
        type="button"
        onClick={() => onChange?.(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        className={cx(
          buttonClass,
          'flex items-center justify-center rounded-full text-bamboo-800 transition hover:bg-sun-100 disabled:pointer-events-none disabled:opacity-40'
        )}
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span
        className={cx(
          'min-w-8 text-center text-sm font-semibold tabular-nums',
          size === 'sm' ? 'px-1' : 'px-2'
        )}
        aria-label={`${label}: ${value}`}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange?.(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        className={cx(
          buttonClass,
          'flex items-center justify-center rounded-full text-bamboo-800 transition hover:bg-sun-100 disabled:pointer-events-none disabled:opacity-40'
        )}
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
