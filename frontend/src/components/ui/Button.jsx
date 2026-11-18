import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cx } from '../../utils/format.js';

const VARIANTS = {
  primary: 'bg-flame-600 text-white shadow-warm hover:bg-flame-700 active:bg-sindoor-700',
  secondary: 'border border-sun-300 bg-white text-ink hover:border-flame-500 hover:bg-sun-50',
  outline: 'border border-flame-600 text-flame-700 hover:bg-flame-50',
  ghost: 'text-bamboo-800 hover:bg-sun-100',
  dark: 'bg-ink text-cream hover:bg-bamboo-900',
  danger: 'bg-red-700 text-white hover:bg-red-800',
};

const SIZES = {
  sm: 'h-9 px-3.5 text-xs',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-7 text-sm',
  icon: 'h-10 w-10',
};

export default function Button({
  as = 'button',
  to,
  href,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  children,
  type = 'button',
  ...rest
}) {
  const classes = cx(
    'inline-flex select-none items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-200 disabled:pointer-events-none disabled:opacity-55',
    VARIANTS[variant],
    SIZES[size],
    className
  );

  const content = (
    <>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  if (href || as === 'a') {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  );
}
