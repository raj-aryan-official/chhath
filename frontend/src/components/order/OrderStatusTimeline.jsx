import { Check, X } from 'lucide-react';
import { STATUS_FLOW } from '../../utils/constants.js';
import { formatDateTime, cx } from '../../utils/format.js';
import { useT } from '../../i18n/useT.js';
import { useCatalogText } from '../../i18n/useCatalogText.js';

export default function OrderStatusTimeline({ order }) {
  const { t } = useT();
  const { status: statusText } = useCatalogText();
  const historyFor = (status) =>
    (order.statusHistory || [])
      .filter((entry) => entry.status === status)
      .slice(-1)[0];

  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const cancelledAt = historyFor('cancelled');

  return (
    <div>
      <ol className="space-y-0">
        {STATUS_FLOW.map((status, index) => {
          const meta = statusText(status);
          const entry = historyFor(status);
          const done = order.status === 'cancelled' ? Boolean(entry) : index <= currentIndex;
          const current = order.status === status;
          const isLast = index === STATUS_FLOW.length - 1;

          return (
            <li key={status} className="relative flex gap-3.5 pb-6 last:pb-0">
              {!isLast && (
                <span
                  className={cx(
                    'absolute left-[11px] top-6 h-full w-px',
                    done ? 'bg-flame-400' : 'bg-sun-200'
                  )}
                  aria-hidden="true"
                />
              )}
              <span
                className={cx(
                  'relative z-10 flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-full border-2',
                  done
                    ? 'border-flame-600 bg-flame-600 text-white'
                    : 'border-sun-300 bg-cream text-sun-400'
                )}
                aria-hidden="true"
              >
                {done ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
              </span>
              <div className="min-w-0 pt-0.5">
                <p
                  className={cx(
                    'text-sm font-medium',
                    current ? 'text-sindoor-700' : done ? 'text-ink' : 'text-bamboo-600'
                  )}
                >
                  {meta.label}
                  {current && order.status !== 'cancelled' && (
                    <span className="ml-2 rounded-full bg-flame-100 px-2 py-0.5 text-[10px] font-medium text-flame-700">
                      {t('orders.timeline.current')}
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-bamboo-600">{meta.description}</p>
                {entry && (
                  <p className="mt-1 text-[11px] text-bamboo-600/80">
                    {formatDateTime(entry.at)}
                    {entry.note ? ` · ${entry.note}` : ''}
                  </p>
                )}
              </div>
            </li>
          );
        })}

        {order.status === 'cancelled' && (
          <li className="flex gap-3.5">
            <span className="flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-full border-2 border-red-600 bg-red-600 text-white">
              <X className="h-3 w-3" aria-hidden="true" />
            </span>
            <div className="pt-0.5">
              <p className="text-sm font-medium text-red-800">{t('orders.timeline.cancelled')}</p>
              <p className="mt-0.5 text-[11px] text-bamboo-600">
                {cancelledAt ? formatDateTime(cancelledAt.at) : statusText('cancelled').description}
              </p>
            </div>
          </li>
        )}
      </ol>
    </div>
  );
}
