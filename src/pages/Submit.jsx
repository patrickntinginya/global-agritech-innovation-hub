import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import Notice from '../components/Notice.jsx';
import { TextField, SelectField, CheckboxField } from '../components/forms.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import useValidation, { rules } from '../hooks/useValidation.js';
import { useI18n } from '../i18n/index.jsx';
import { categories } from '../data/categories.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { createSubmission } from '../services/accountService.js';
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
  const { user } = useAuth();
  const [state, setState] = useState({ busy: false, done: false, error: null });
  const { errors, validate, clearError } = useValidation(schema);
  const set = (k) => (v) => {
    setForm((f) => ({ ...f, [k]: v }));
    clearError(k);
    setState((s) => ({ ...s, done: false }));
  };

  return (
    <>
      <PageHeader title={t('actions.submit')} description={t('submit.desc')} crumbs={[{ label: t('nav.home'), to: '/' }, { label: t('actions.submit') }]} />
      <section className="section section--compact">
        <div className="container narrow">
          <Notice kind="info" title={t('submit.reviewTitle')}>
            {t('submit.reviewNotice')}
          </Notice>
          <form
            noValidate
            className="form-card"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!validate(form)) return;
              setState({ busy: true, done: false, error: null });
              try {
                await createSubmission(user.id, form);
                setForm((f) => ({ ...f, title: '', organization: '', description: '', consent: false }));
                setState({ busy: false, done: true, error: null });
              } catch (err) {
                setState({ busy: false, done: false, error: err });
              }
            }}
          >
            <SelectField label={t('submit.kind')} value={form.kind} onValue={set('kind')} options={kinds.map((k) => ({ value: k, label: t(`submit.kinds.${k}`) }))} />
            <TextField label={t('submit.name')} value={form.title} onValue={set('title')} error={errors.title} required />
            <TextField label={t('submit.organization')} value={form.organization} onValue={set('organization')} error={errors.organization} required autoComplete="organization" />
            <SelectField label={t('explore.country')} value={form.country} onValue={set('country')} options={countries.map((c) => ({ value: c.id, label: loc(c.name) }))} />
            <SelectField label={t('explore.category')} value={form.category} onValue={set('category')} options={categories.map((c) => ({ value: c.id, label: loc(c.title) }))} />
            <TextField label={t('submit.description')} hint={t('submit.descriptionHint')} as="textarea" rows={6} value={form.description} onValue={set('description')} error={errors.description} required />
            <TextField label={t('forms.email')} type="email" value={form.email} onValue={set('email')} error={errors.email} required autoComplete="email" />
            <CheckboxField label={t('submit.consentReal')} checked={form.consent} onValue={set('consent')} />
            {errors.consent && (
              <p className="form-field__error" role="alert">
                {t(errors.consent)}
              </p>
            )}
            {state.done && (
              <Notice kind="info" title={t('submit.receivedTitle')}>
                {t('submit.received')} <Link to="/dashboard">{t('account.dashboard')}</Link>
              </Notice>
            )}
            {state.error && <p className="form-field__error" role="alert">{t(`errors.service.${state.error.code ?? 'unknown'}.body`)}</p>}
            <div className="btn-row">
              <button type="submit" className="btn btn--primary" disabled={state.busy}>
                {state.busy ? t('account.sending') : t('submit.send')}
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
