import { useMemo, useState } from 'react';
import { SelectField, TextField } from '../../components/forms.jsx';
import { useI18n } from '../../i18n/index.jsx';
import { categories } from '../../data/categories.js';
import { countries } from '../../data/countries.js';
import { formToRow, rowToForm, validateForm } from './adminResources.js';

export const enumLabel = (t, value) => {
  if (value == null || value === '') return '';
  const key = `adm.v.${value}`;
  const label = t(key);
  return label === key ? String(value) : label;
};

// Generic create / edit form generated from a resource spec. A failed save keeps the dialog open and says why.
export default function AdminForm({ resource, row, onSaved, onCancel, save }) {
  const { t, loc } = useI18n();
  const creating = !row;
  const [values, setValues] = useState(() => rowToForm(resource, row));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState(null);
  const set = (k) => (v) => { setValues((s) => ({ ...s, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); setFailure(null); };

  const sources = useMemo(() => ({
    categories: [{ value: '', label: '—' }, ...categories.map((c) => ({ value: c.id, label: loc(c.title) }))],
    countries: [{ value: '', label: '—' }, ...countries.map((c) => ({ value: c.id, label: loc(c.name) }))],
  }), [loc]);

  const submit = async (e) => {
    e.preventDefault();
    const found = validateForm(resource, values, { creating });
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    setFailure(null);
    try {
      const saved = await save(formToRow(resource, values, { creating }), row);
      onSaved(saved, creating);
    } catch (err) {
      setFailure(err);
      setBusy(false);
    }
  };

  const renderField = (f) => {
    const label = t(`adm.f.${f.name}`);
    const req = Boolean(f.required);
    if (['bi', 'bitext', 'bilist'].includes(f.kind)) {
      return ['en', 'sw'].map((lng) => (
        <TextField
          key={`${f.name}-${lng}`} label={`${label} (${lng === 'en' ? 'English' : 'Kiswahili'})`} hint={f.kind === 'bilist' ? t('adm.onePerLine') : undefined}
          as={f.kind === 'bi' ? 'input' : 'textarea'} rows={f.kind === 'bilist' ? 4 : 3} value={values[`${f.name}__${lng}`]}
          onValue={set(`${f.name}__${lng}`)} error={errors[`${f.name}__${lng}`]} required={req && f.kind !== 'bilist'}
        />
      ));
    }
    if (f.kind === 'select') {
      const options = f.source ? sources[f.source] : [{ value: '', label: '—' }, ...f.options.map((v) => ({ value: v, label: enumLabel(t, v) }))];
      return <SelectField key={f.name} label={label} value={values[f.name]} onValue={set(f.name)} options={options} error={errors[f.name]} required={req} />;
    }
    const readOnly = f.createOnly && !creating;
    return (
      <TextField
        key={f.name} label={label} hint={f.kind === 'tags' ? t('adm.commaSeparated') : f.kind === 'slug' ? t('adm.slugHint') : undefined}
        type={f.kind === 'int' ? 'number' : f.kind === 'date' ? 'date' : 'text'} value={values[f.name]} onValue={set(f.name)}
        error={errors[f.name]} required={req} readOnly={readOnly} maxLength={f.max}
      />
    );
  };

  return (
    <form noValidate onSubmit={submit}>
      {resource.fields.map(renderField)}
      {failure && <p className="form-field__error" role="alert">{t(`errors.service.${failure.code ?? 'unknown'}.body`)}</p>}
      <div className="btn-row">
        <button type="submit" className="btn btn--primary" disabled={busy}>{busy ? t('account.saving') : t('adm.save')}</button>
        <button type="button" className="btn btn--ghost" onClick={onCancel}>{t('ui.cancel')}</button>
      </div>
    </form>
  );
}
