import { useId } from 'react';
import { useI18n } from '../i18n/index.jsx';

function useFieldIds(name) {
  const uid = useId();
  const id = `${name}-${uid}`;
  return { id, errId: `${id}-err`, hintId: `${id}-hint` };
}

function FieldShell({ id, errId, hintId, label, required, error, hint, children }) {
  const { t } = useI18n();
  return (
    <div className={`field ${error ? 'field--invalid' : ''}`}>
      <label htmlFor={id}>
        {label}
        {required && <span className="req" aria-hidden="true"> *</span>}
        {required && <span className="visually-hidden"> ({t('common.required')})</span>}
      </label>
      {children}
      {hint && <p className="field__hint" id={hintId}>{hint}</p>}
      {error && <p className="field__error" id={errId} role="alert">{t(error.key, error.vars)}</p>}
    </div>
  );
}

const describe = (error, hint, errId, hintId) => [error && errId, hint && hintId].filter(Boolean).join(' ') || undefined;

export function TextField({ name, label, value, onChange, error, hint, required, type = 'text', autoComplete, placeholder, maxLength }) {
  const ids = useFieldIds(name);
  return (
    <FieldShell {...ids} label={label} required={required} error={error} hint={hint}>
      <input
        id={ids.id} name={name} type={type} className="input" value={value} placeholder={placeholder} maxLength={maxLength}
        autoComplete={autoComplete} onChange={(e) => onChange(name, e.target.value)}
        aria-invalid={error ? 'true' : undefined} aria-required={required || undefined}
        aria-describedby={describe(error, hint, ids.errId, ids.hintId)}
      />
    </FieldShell>
  );
}

export function TextAreaField({ name, label, value, onChange, error, hint, required, rows = 5, maxLength }) {
  const ids = useFieldIds(name);
  return (
    <FieldShell {...ids} label={label} required={required} error={error} hint={hint}>
      <textarea
        id={ids.id} name={name} className="input" rows={rows} value={value} maxLength={maxLength}
        onChange={(e) => onChange(name, e.target.value)}
        aria-invalid={error ? 'true' : undefined} aria-required={required || undefined}
        aria-describedby={describe(error, hint, ids.errId, ids.hintId)}
      />
    </FieldShell>
  );
}

// options: [{ value, label }]
export function SelectField({ name, label, value, onChange, options, error, hint, required, placeholder }) {
  const ids = useFieldIds(name);
  return (
    <FieldShell {...ids} label={label} required={required} error={error} hint={hint}>
      <select
        id={ids.id} name={name} className="select" value={value} onChange={(e) => onChange(name, e.target.value)}
        aria-invalid={error ? 'true' : undefined} aria-required={required || undefined}
        aria-describedby={describe(error, hint, ids.errId, ids.hintId)}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </FieldShell>
  );
}

export function CheckboxField({ name, label, checked, onChange, error, hint }) {
  const ids = useFieldIds(name);
  const { t } = useI18n();
  return (
    <div className={`field field--check ${error ? 'field--invalid' : ''}`}>
      <label htmlFor={ids.id} className="check">
        <input
          id={ids.id} name={name} type="checkbox" checked={checked} onChange={(e) => onChange(name, e.target.checked)}
          aria-invalid={error ? 'true' : undefined} aria-describedby={describe(error, hint, ids.errId, ids.hintId)}
        />
        <span>{label}</span>
      </label>
      {hint && <p className="field__hint" id={ids.hintId}>{hint}</p>}
      {error && <p className="field__error" id={ids.errId} role="alert">{t(error.key, error.vars)}</p>}
    </div>
  );
}

// PreviewForm imports this name; it is the same control as CheckboxField.
export { CheckboxField as CheckField };
