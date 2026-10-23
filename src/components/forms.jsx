import { useId } from 'react';
import { useI18n } from '../i18n/index.jsx';

// Turns a validation result ('ui.errors.required' or { key, vars }) into translated text.
export function useErrorText() {
  const { t } = useI18n();
  return (err) => {
    if (!err) return '';
    return typeof err === 'string' ? t(err) : t(err.key, err.vars);
  };
}

function Wrapper({ id, label, hint, error, required, children }) {
  const errText = useErrorText()(error);
  const { t } = useI18n();
  return (
    <div className={`form-field ${errText ? 'has-error' : ''}`}>
      <label htmlFor={id}>
        {label}
        {required && <span className="req" aria-hidden="true"> *</span>}
        {required && <span className="visually-hidden"> ({t('ui.requiredField')})</span>}
      </label>
      {hint && <p className="form-field__hint" id={`${id}-hint`}>{hint}</p>}
      {children}
      {errText && (
        <p className="form-field__error" id={`${id}-error`} role="alert">
          {errText}
        </p>
      )}
    </div>
  );
}

const describedBy = (id, hint, error) => [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined;

export function TextField({ label, hint, error, required, as = 'input', rows = 5, onValue, ...rest }) {
  const id = useId();
  const Tag = as;
  return (
    <Wrapper id={id} label={label} hint={hint} error={error} required={required}>
      <Tag
        id={id}
        rows={as === 'textarea' ? rows : undefined}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy(id, hint, error)}
        aria-required={required ? 'true' : undefined}
        onChange={(e) => onValue?.(e.target.value)}
        {...rest}
      />
    </Wrapper>
  );
}

export function SelectField({ label, hint, error, required, options, onValue, ...rest }) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} hint={hint} error={error} required={required}>
      <select
        id={id}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy(id, hint, error)}
        aria-required={required ? 'true' : undefined}
        onChange={(e) => onValue?.(e.target.value)}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Wrapper>
  );
}

export function CheckboxField({ label, checked, onValue, hint }) {
  const id = useId();
  return (
    <div className="form-check">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onValue(e.target.checked)} aria-describedby={hint ? `${id}-hint` : undefined} />
      <label htmlFor={id}>{label}</label>
      {hint && <p className="form-field__hint" id={`${id}-hint`}>{hint}</p>}
    </div>
  );
}

// Compact filter control used in directory toolbars (label above, select below).
export function FilterSelect({ label, value, onChange, options }) {
  const id = useId();
  return (
    <div className="filter-select">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
