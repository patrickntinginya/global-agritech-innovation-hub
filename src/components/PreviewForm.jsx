import { useState } from 'react';
import { CheckField, SelectField, TextAreaField, TextField } from './FormFields.jsx';
import { validate } from '../utils/validation.js';
import { useI18n } from '../i18n/index.jsx';

// A validated form that never sends or stores anything. On a valid submit it calls `onValid`
// (for local, in-tab effects) and shows an honest "preview only" message.
// fields: [{ name, labelKey, type: text|email|password|textarea|select|checkbox, options, placeholder, autoComplete, hintKey }]
export default function PreviewForm({
  fields, rules = {}, initial = {}, submitLabel, onValid, onCancel,
  showResult = true, resultKey = 'notices.previewResult', clearOnSubmit = [],
}) {
  const { t } = useI18n();
  const [values, setValues] = useState(() =>
    Object.fromEntries(fields.map((f) => [f.name, initial[f.name] ?? (f.type === 'checkbox' ? false : '')])),
  );
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);

  const setValue = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e));
    setDone(false);
  };

  const submit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const found = validate(values, rules);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // Move focus to the first invalid field so keyboard and screen reader users land on it.
      const first = fields.find((f) => found[f.name]);
      if (first) form.querySelector(`[name="${first.name}"]`)?.focus();
      return;
    }
    onValid?.(values);
    if (clearOnSubmit.length) setValues((v) => ({ ...v, ...Object.fromEntries(clearOnSubmit.map((k) => [k, ''])) }));
    setDone(true);
  };

  return (
    <form className="form" onSubmit={submit} noValidate>
      {fields.map((f) => {
        const common = { name: f.name, label: t(f.labelKey), error: errors[f.name], required: (rules[f.name] ?? []).includes('required') };
        if (f.type === 'checkbox')
          return <CheckField key={f.name} {...common} checked={values[f.name]} onChange={setValue} />;
        if (f.type === 'textarea')
          return <TextAreaField key={f.name} {...common} value={values[f.name]} onChange={setValue} placeholder={f.placeholder} hint={f.hintKey && t(f.hintKey)} />;
        if (f.type === 'select')
          return <SelectField key={f.name} {...common} value={values[f.name]} onChange={setValue} options={f.options} placeholder={f.placeholder ?? t('common.choose')} hint={f.hintKey && t(f.hintKey)} />;
        return (
          <TextField
            key={f.name} {...common} type={f.type ?? 'text'} value={values[f.name]} onChange={setValue}
            placeholder={f.placeholder} autoComplete={f.autoComplete} hint={f.hintKey && t(f.hintKey)}
          />
        );
      })}
      <div className="btn-row">
        <button type="submit" className="btn btn--primary">{submitLabel}</button>
        {onCancel && (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>{t('common.cancel')}</button>
        )}
      </div>
      {showResult && done && (
        <p className="notice notice--result" role="status">{t(resultKey)}</p>
      )}
    </form>
  );
}
