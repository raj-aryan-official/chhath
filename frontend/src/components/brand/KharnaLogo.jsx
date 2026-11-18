import { useId } from 'react';
import { Link } from 'react-router-dom';
import { cx } from '../../utils/format.js';

const RAY_ANGLES = Array.from({ length: 14 }, (_, index) => (index * 360) / 14);

export function KharnaMark({ className, mono = false, title }) {
  const gradientId = `kharna-sun-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const sunFill = mono ? 'none' : `url(#${gradientId})`;
  const silhouette = mono ? 'currentColor' : '#9A3412';
  const wave = mono ? 'currentColor' : '#F97316';

  return (
    <svg
      viewBox="0 0 128 128"
      className={cx('block', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <linearGradient id={gradientId} x1="24" y1="20" x2="108" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FBBF24" />
          <stop offset="0.6" stopColor="#F97316" />
          <stop offset="1" stopColor="#EA580C" />
        </linearGradient>
      </defs>

      <circle
        cx="64"
        cy="54"
        r="25"
        fill={sunFill}
        stroke={mono ? 'currentColor' : 'none'}
        strokeWidth={mono ? 2.6 : 0}
      />

      <g fill={mono ? 'currentColor' : `url(#${gradientId})`}>
        {RAY_ANGLES.map((angle) => (
          <path
            key={angle}
            transform={`translate(64 54) rotate(${angle})`}
            d="M-2.2 -32 L0 -44 L2.2 -32 Z"
          />
        ))}
      </g>

      <g fill={silhouette}>
        <circle cx="60.5" cy="41" r="5.4" />
        <path d="M58.2 45.5 h4.8 l1.2 5.2 h-7.2 z" />
        <path d="M55.2 49.5 C53.2 53.5 52 57 51.6 61.5 C51 68 48.6 82 46.6 93.5 L74.8 93.5 C73.4 82 71.4 68 70.6 61.5 C70.2 57 69.2 53.5 67.2 49.5 C63.4 46.6 59 46.6 55.2 49.5 Z" />
      </g>

      <path
        d="M66.8 50.8 C71.5 51.5 75.5 53.8 79 56.4"
        fill="none"
        stroke={silhouette}
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      <g fill="none" stroke={silhouette} strokeLinecap="round">
        <path d="M75.5 56.6 C80 54.2 88 54.2 92.5 56.6" strokeWidth="2.4" />
        <path d="M76.5 57.4 C79.5 62.6 88.5 62.6 91.5 57.4" strokeWidth="2" />
        <path d="M80 58.8 v2.2 M84 59.4 v2.6 M88 58.8 v2.2" strokeWidth="1.2" />
      </g>

      <path d="M81.8 53.4 h4.4 l-0.7 1.6 h-3 z" fill={silhouette} />
      <path
        d="M84 47.6 C85.9 50.2 86 52 84 52.6 C82 52 82.1 50.2 84 47.6 Z"
        fill={mono ? 'currentColor' : '#F97316'}
      />

      <g fill="none" stroke={wave} strokeLinecap="round">
        <path
          d="M12 96 q 7 -4.5 14 0 t 14 0 t 14 0 t 14 0 t 14 0 t 14 0 t 14 0"
          strokeWidth="2.6"
        />
        <path
          d="M18 103 q 7 -4 14 0 t 14 0 t 14 0 t 14 0 t 14 0 t 14 0"
          strokeWidth="2.4"
          opacity="0.8"
        />
        <path d="M26 110 q 6 -3.5 12 0 t 12 0 t 12 0 t 12 0 t 12 0" strokeWidth="2.2" opacity="0.55" />
      </g>
    </svg>
  );
}

export default function KharnaLogo({
  variant = 'horizontal',
  mono = false,
  to,
  className,
  markClassName = 'h-10 w-10',
  showTagline = true,
}) {
  const wordmark = (
    <>
      <span className="font-display text-[1.3rem] font-semibold leading-none tracking-[0.26em]">
        KHARNA
      </span>
      {showTagline && (
        <span
          className={cx(
            'mt-1.5 block text-[8.5px] font-medium uppercase tracking-[0.42em]',
            mono ? 'text-white/80' : 'text-sindoor-700'
          )}
        >
          Chhath Sarees
        </span>
      )}
    </>
  );

  const body =
    variant === 'mark' ? (
      <KharnaMark className={markClassName} mono={mono} />
    ) : (
      <span
        className={cx(
          'flex',
          variant === 'stacked' ? 'flex-col items-center gap-3 text-center' : 'items-center gap-3'
        )}
      >
        <KharnaMark className={markClassName} mono={mono} />
        <span className={cx('flex flex-col', mono ? 'text-white' : 'text-ink')}>{wordmark}</span>
      </span>
    );

  if (to) {
    return (
      <Link
        to={to}
        aria-label="Kharna — home"
        className={cx('inline-flex items-center transition hover:opacity-90', className)}
      >
        {body}
      </Link>
    );
  }

  return <span className={cx('inline-flex items-center', className)}>{body}</span>;
}
