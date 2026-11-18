import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap.js';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock.js';
import { cx } from '../../utils/format.js';

export default function Drawer({
  open,
  onClose,
  side = 'right',
  title,
  children,
  footer,
  panelClassName,
}) {
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

  const isSide = side === 'right' || side === 'left';
  const isRight = side === 'right';

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[75]">
          <motion.div
            className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Panel'}
            className={cx(
              'absolute flex flex-col bg-cream shadow-warm-lg',
              isRight && 'inset-y-0 right-0 w-full max-w-md border-l border-sun-200',
              side === 'left' && 'inset-y-0 left-0 w-full max-w-sm border-r border-sun-200',
              !isSide && 'inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl border-t border-sun-200',
              panelClassName
            )}
            initial={isSide ? { x: isRight ? '100%' : '-100%' } : { y: '100%' }}
            animate={isSide ? { x: 0 } : { y: 0 }}
            exit={isSide ? { x: isRight ? '100%' : '-100%' } : { y: '100%' }}
            transition={{ type: 'tween', duration: 0.28, ease: 'easeOut' }}
          >
            <div className="flex items-center justify-between gap-4 border-b border-sun-200/80 px-5 py-4">
              {title ? <h2 className="font-display text-lg text-ink">{title}</h2> : <span />}
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-bamboo-700 transition hover:bg-sun-100 hover:text-sindoor-700"
                aria-label="Close panel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
            {footer && <div className="border-t border-sun-200 bg-white/60 px-5 py-4">{footer}</div>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
