import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap.js';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock.js';
import { cx } from '../../utils/format.js';

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export default function Modal({ open, onClose, title, children, footer, size = 'md', className }) {
  const panelRef = useRef(null);
  useBodyScrollLock(open);
  useFocusTrap(panelRef, open);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Dialog'}
            className={cx(
              'relative max-h-[90vh] w-full overflow-y-auto rounded-3xl border border-sun-200 bg-cream shadow-warm-lg',
              SIZES[size],
              className
            )}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-sun-200/80 px-6 py-4">
              {title ? <h2 className="font-display text-xl text-ink">{title}</h2> : <span />}
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-bamboo-700 transition hover:bg-sun-100 hover:text-sindoor-700"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5">{children}</div>
            {footer && <div className="border-t border-sun-200/80 px-6 py-4">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
