import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import Notice from '../components/Notice.jsx';
import { TextField, SelectField, CheckboxField } from '../components/forms.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import useValidation, { rules } from '../hooks/useValidation.js';
import { useI18n } from '../i18n/index.jsx';
import { categories } from '../data/categories.js';
import { countries } from '../data/countries.js';

const schema = {
  title: [rules.required, rules.min(5)],
  organization: [rules.required],
  description: [rules.required, rules.min(30)],
  email: [rules.required, rules.email],
  consent: [(v) => (v ? null : 'ui.errors.consent')],
};
const kinds = ['innovation', 'startup', 'opportunity'];

export default function Submit() {
  const { t, loc } = useI18n();
  usePageTitle(t('actions.submit'));
  const [params] = useSearchParams();
  const initialKind = kinds.includes(params.get('type')) ? params.get('type') : 'innovation';
  const [form, setForm] = useState({ kind: initialKind, title: '', organization: '', country: 'africa', category: 'smart-farming', description: '', email: '', consent: false });
  const [checked, setChecked] = useState(false);
  const { errors, validate, clearError } = useValidation(schema);
  const set = (k) => (v) => {
    setForm((f) => ({ ...f, [k]: v }));
    clearError(k);
    setChecked(false);
  };

  return (
    <>
      <PageHeader title={t('actions.submit')} description={t('submit.desc')} crumbs={[{ label: t('nav.home'), to: '/' }, { label: t('actions.submit') }]} />
      <section className="section section--compact">
        <div className="container narrow">
          <Notice kind="backend" title={t('submit.noticeTitle')}>
            {t('submit.notice')}
          </Notice>
          <form
            noValidate
            className="form-card"
            onSubmit={(e) => {
              e.preventDefault();
              setChecked(validate(form));
            }}
          >
            <SelectField label={t('submit.kind')} value={form.kind} onValue={set('kind')} options={kinds.map((k) => ({ value: k, label: t(`submit.kinds.${k}`) }))} />
            <TextField label={t('submit.name')} value={form.title} onValue={set('title')} error={errors.title} required />
            <TextField label={t('submit.organization')} value={form.organization} onValue={set('organization')} error={errors.organization} required autoComplete="organization" />
            <SelectField label={t('explore.country')} value={form.country} onValue={set('country')} options={countries.map((c) => ({ value: c.id, label: loc(c.name) }))} />
            <SelectField label={t('explore.category')} value={form.category} onValue={set('category')} options={categories.map((c) => ({ value: c.id, label: loc(c.title) }))} />
            <TextField label={t('submit.description')} hint={t('submit.descriptionHint')} as="textarea" rows={6} value={form.description} onValue={set('description')} error={errors.description} required />
            <TextField label={t('forms.email')} type="email" value={form.email} onValue={set('email')} error={errors.email} required autoComplete="email" />
            <CheckboxField label={t('submit.consent')} checked={form.consent} onValue={set('consent')} />
            {errors.consent && (
              <p className="form-field__error" role="alert">
                {t(errors.consent)}
              </p>
            )}
            {checked && (
              <Notice kind="backend" title={t('ui.previewTitle')}>
                {t('submit.previewNote')}
              </Notice>
            )}
            <div className="btn-row">
              <button type="submit" className="btn btn--primary">
                {t('submit.check')}
              </button>
              <Link to="/" className="btn btn--ghost">
                {t('actions.backHome')}
              </Link>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
