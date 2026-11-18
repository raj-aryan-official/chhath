import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useT } from '../../i18n/useT.js';

const PasswordInput = forwardRef(function PasswordInput(
  { id, label, error, autoComplete = 'current-password', hint, ...field },
  ref
) {
  const [visible, setVisible] = useState(false);
  const { t } = useT();

  return (
    <div>
      <label htmlFor={id} className="label-base">
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className="input-base pr-11"
          {...field}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-bamboo-600 transition hover:bg-sun-100 hover:text-sindoor-700"
          aria-label={visible ? t('auth.password.hide') : t('auth.password.show')}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-700" role="alert">
          {error.message}
        </p>
      )}
      {!error && hint && (
        <p id={`${id}-hint`} className="mt-1 text-[11px] text-bamboo-600">
          {hint}
        </p>
      )}
    </div>
  );
});

export default PasswordInput;
