import { cx } from '../../utils/format.js';

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cx(
        'flex flex-col items-center justify-center rounded-3xl border border-dashed border-sun-300 bg-white/60 px-6 py-14 text-center',
        className
      )}
    >
      {Icon && (
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sun-100 text-flame-600">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </span>
      )}
      <h3 className="font-display text-2xl text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm leading-relaxed text-bamboo-700">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
