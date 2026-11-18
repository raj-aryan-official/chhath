import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { dismissToast } from '../../store/slices/uiSlice.js';
import { cx } from '../../utils/format.js';

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const TONES = {
  success: 'border-emerald-200 bg-white text-emerald-900',
  error: 'border-red-200 bg-white text-red-900',
  info: 'border-sun-300 bg-white text-bamboo-800',
};

function Toast({ toast, onDismiss }) {
  const Icon = ICONS[toast.type] || Info;

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4200);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      className={cx(
        'pointer-events-auto flex w-full items-start gap-3 rounded-2xl border px-4 py-3 shadow-warm',
        TONES[toast.type]
      )}
      role={toast.type === 'error' ? 'alert' : 'status'}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <p className="flex-1 text-sm leading-snug">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="rounded-full p-1 text-current/60 transition hover:bg-black/5"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export default function Toaster() {
  const toasts = useSelector((state) => state.ui.toasts);
  const dispatch = useDispatch();
  const onDismiss = useCallback((id) => dispatch(dismissToast(id)), [dispatch]);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[90] mx-auto flex w-full max-w-sm flex-col gap-2 px-4 sm:inset-x-auto sm:right-6 sm:bottom-6"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
