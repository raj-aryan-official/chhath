import { useState } from 'react';
import { Expand } from 'lucide-react';
import LazyImage from '../ui/LazyImage.jsx';
import Modal from '../ui/Modal.jsx';
import { cx } from '../../utils/format.js';
import { useT } from '../../i18n/useT.js';

export default function Gallery({ images = [], name }) {
  const { t } = useT();
  const [active, setActive] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const current = images[active] || images[0];

  return (
    <div className="space-y-3">
      <div className="group relative overflow-hidden rounded-3xl border border-sun-200/70 bg-sun-100 shadow-warm">
        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          className="block w-full text-left"
          aria-label={t('product.galleryZoomAria', { name })}
        >
          <LazyImage
            src={current}
            alt={t('product.galleryImageAlt', { name, current: active + 1, total: images.length })}
            aspect="3 / 4"
            width={900}
            height={1200}
            eager
            className="transition-transform duration-700 group-hover:scale-[1.03]"
            wrapperClassName="bg-sun-100"
          />
        </button>
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/20 to-transparent opacity-0 transition group-hover:opacity-100" />
        <span className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-cream/90 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-bamboo-800 opacity-0 shadow-soft transition group-hover:opacity-100">
          <Expand className="h-3 w-3" aria-hidden="true" />
          {t('product.galleryZoom')}
        </span>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={t('product.galleryShow', { index: index + 1 })}
              aria-current={index === active}
              className={cx(
                'w-16 shrink-0 overflow-hidden rounded-xl border bg-white transition sm:w-20',
                index === active
                  ? 'border-flame-600 ring-2 ring-flame-500/30'
                  : 'border-sun-200 hover:border-flame-400'
              )}
            >
              <LazyImage
                src={image}
                alt=""
                aspect="3 / 4"
                width={160}
                height={213}
                objectFit="cover"
              />
            </button>
          ))}
        </div>
      )}

      <Modal open={zoomOpen} onClose={() => setZoomOpen(false)} title={name} size="xl">
        <img
          src={current}
          alt={t('product.galleryFullAlt', { name })}
          className="mx-auto max-h-[70vh] w-auto rounded-2xl object-contain"
        />
      </Modal>
    </div>
  );
}
