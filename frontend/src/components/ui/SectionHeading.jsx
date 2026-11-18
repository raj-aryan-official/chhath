import { cx } from '../../utils/format.js';

export default function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = 'left',
  className,
}) {
  return (
    <div
      className={cx(
        'flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between',
        align === 'center' && 'sm:flex-col sm:items-center sm:text-center',
        className
      )}
    >
      <div className={cx('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl">{title}</h2>
        {description && (
          <p className="mt-3 text-sm leading-relaxed text-bamboo-700 sm:text-[15px]">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
