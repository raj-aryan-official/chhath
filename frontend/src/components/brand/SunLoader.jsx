import { KharnaMark } from './KharnaLogo.jsx';
import { cx } from '../../utils/format.js';

export default function SunLoader({ className, label = 'Lighting the diyas…' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cx(
        'flex min-h-[70vh] w-full flex-col items-center justify-center gap-6 bg-cream px-6 py-16',
        className
      )}
    >
      <div className="relative flex h-24 w-24 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-sun-400/35 blur-2xl animate-glow-pulse" />
        <span className="absolute -inset-3 rounded-full border border-dashed border-flame-400/45 animate-spin-slow" />
        <KharnaMark className="relative h-16 w-16 animate-float-y" />
      </div>
      <p className="font-display text-lg text-bamboo-800">{label}</p>
      <span className="sr-only">Loading</span>
    </div>
  );
}
