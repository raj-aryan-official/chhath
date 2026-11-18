import { cx } from '../../utils/format.js';

export default function DiyaDivider({ className }) {
  return (
    <svg
      viewBox="0 0 320 28"
      aria-hidden="true"
      className={cx('h-7 w-full max-w-sm text-flame-500', className)}
      fill="none"
    >
      <path d="M0 16h112" stroke="currentColor" strokeWidth="1" opacity="0.35" strokeLinecap="round" />
      <path d="M208 16h112" stroke="currentColor" strokeWidth="1" opacity="0.35" strokeLinecap="round" />
      {[136, 160, 184].map((x, index) => (
        <g key={x} transform={`translate(${x} 14)`}>
          <path d="M-7 0 h14 l-2.6 5.2 h-8.8 Z" fill="currentColor" opacity={index === 1 ? 1 : 0.7} />
          <path
            d="M0 -11 C3 -6.5 3.2 -3.6 0 -2.6 C-3.2 -3.6 -3 -6.5 0 -11 Z"
            fill="currentColor"
            opacity={index === 1 ? 1 : 0.7}
          />
          <circle cx="0" cy="-1.6" r="0.9" fill="#FFF8EC" opacity="0.9" />
        </g>
      ))}
      <circle cx="160" cy="16" r="1.4" fill="currentColor" opacity="0.35" />
    </svg>
  );
}
