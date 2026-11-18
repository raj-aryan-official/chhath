import { cx } from '../../utils/format.js';

const TONES = {
  sun: 'border-sun-300 bg-sun-100 text-bamboo-800',
  flame: 'border-flame-300 bg-flame-100 text-flame-700',
  sindoor: 'border-sindoor-600/30 bg-sindoor-600/10 text-sindoor-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  neutral: 'border-stone-300 bg-stone-100 text-stone-700',
  dark: 'border-ink bg-ink text-cream',
};

export default function Badge({ tone = 'sun', className, children }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide',
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
