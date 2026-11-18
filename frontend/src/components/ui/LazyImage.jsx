import { useState } from 'react';
import { cx } from '../../utils/format.js';

const CLOUDINARY_HOST = 'res.cloudinary.com';

const buildSrcSet = (src) => {
  if (!src?.includes(CLOUDINARY_HOST)) return undefined;
  return [400, 600, 800, 1200]
    .map((width) => `${src.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`)} ${width}w`)
    .join(', ');
};

export default function LazyImage({
  src,
  alt,
  width = 900,
  height = 1200,
  eager = false,
  className,
  wrapperClassName,
  aspect = '3 / 4',
  objectFit = 'cover',
  ...rest
}) {
  const [loaded, setLoaded] = useState(false);
  const srcSet = buildSrcSet(src);

  return (
    <div
      className={cx('relative overflow-hidden bg-sun-100', wrapperClassName)}
      style={{ aspectRatio: aspect }}
    >
      {!loaded && <span className="skeleton absolute inset-0 rounded-none" aria-hidden="true" />}
      <img
        src={src}
        srcSet={srcSet}
        sizes={srcSet ? '(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw' : undefined}
        alt={alt}
        width={width}
        height={height}
        loading={eager ? 'eager' : 'lazy'}
        fetchpriority={eager ? 'high' : 'auto'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={cx(
          'h-full w-full transition-opacity duration-500',
          objectFit === 'cover' ? 'object-cover' : 'object-contain',
          loaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        {...rest}
      />
    </div>
  );
}
