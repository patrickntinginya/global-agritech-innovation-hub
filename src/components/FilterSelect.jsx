import { useId } from 'react';
import { useI18n } from '../i18n/index.jsx';

// options: [{ value, label }]. An "All" option is added automatically.
export default function FilterSelect({ label, value, options, onChange, allLabel }) {
  const id = useId();
  const { t } = useI18n();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} className="select" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{allLabel ?? t('common.all')}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
