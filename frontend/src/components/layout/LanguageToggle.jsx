import { useDispatch } from 'react-redux';
import { setLanguage } from '../../store/slices/languageSlice.js';
import { useT } from '../../i18n/useT.js';
import { cx } from '../../utils/format.js';

const OPTIONS = [
  { code: 'hi', short: 'हिं', long: 'हिंदी' },
  { code: 'en', short: 'EN', long: 'English' },
];

export default function LanguageToggle({ className, full = false }) {
  const dispatch = useDispatch();
  const { lang, t } = useT();

  return (
    <div
      className={cx(
        'inline-flex items-center rounded-full border border-sun-300 bg-white/85 p-0.5 text-[11px] font-semibold',
        className
      )}
      role="group"
      aria-label={t('common.language')}
    >
      {OPTIONS.map((option) => (
        <button
          key={option.code}
          type="button"
          onClick={() => dispatch(setLanguage(option.code))}
          aria-pressed={lang === option.code}
          className={cx(
            'rounded-full px-2.5 py-1 transition',
            full && 'px-3',
            lang === option.code
              ? 'bg-flame-600 text-white shadow-sm'
              : 'text-bamboo-700 hover:bg-sun-100'
          )}
        >
          {full ? option.long : option.short}
        </button>
      ))}
    </div>
  );
}
