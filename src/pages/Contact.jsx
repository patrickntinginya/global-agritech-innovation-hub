import { useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import Notice from '../components/Notice.jsx';
import { TextField, SelectField } from '../components/forms.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import useValidation, { rules } from '../hooks/useValidation.js';
import { useI18n } from '../i18n/index.jsx';
import { sendContactMessage } from '../services/accountService.js';

const schema = {
  name: [rules.required],
  email: [rules.required, rules.email],
  subject: [rules.required],
  message: [rules.required, rules.min(15)],
};
const reasons = ['general', 'listing', 'partnership', 'feedback', 'problem'];

export default function Contact() {
  const { t } = useI18n();
  usePageTitle(t('footer.contact'));
  const [form, setForm] = useState({ name: '', email: '', reason: 'general', subject: '', message: '' });
  const [state, setState] = useState({ busy: false, sent: false, error: null });
  const { errors, validate, clearError } = useValidation(schema);
  const set = (k) => (v) => {
    setForm((f) => ({ ...f, [k]: v }));
    clearError(k);
    setState((s) => ({ ...s, sent: false }));
  };
  return (
    <>
      <PageHeader title={t('footer.contact')} description={t('contact.desc')} crumbs={[{ label: t('nav.home'), to: '/' }, { label: t('footer.contact') }]} />
      <section className="section section--compact">
        <div className="container contact-grid">
          <form
            noValidate
            className="form-card"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!validate(form)) return;
              setState({ busy: true, sent: false, error: null });
              try {
                await sendContactMessage(form);
                setForm({ name: '', email: '', reason: 'general', subject: '', message: '' });
                setState({ busy: false, sent: true, error: null });
              } catch (err) {
                setState({ busy: false, sent: false, error: err });
              }
            }}
          >
            <TextField label={t('forms.name')} value={form.name} onValue={set('name')} error={errors.name} required autoComplete="name" />
            <TextField label={t('forms.email')} type="email" value={form.email} onValue={set('email')} error={errors.email} required autoComplete="email" />
            <SelectField label={t('contact.reason')} value={form.reason} onValue={set('reason')} options={reasons.map((r) => ({ value: r, label: t(`contact.reasons.${r}`) }))} />
            <TextField label={t('contact.subject')} value={form.subject} onValue={set('subject')} error={errors.subject} required />
            <TextField label={t('forms.message')} as="textarea" rows={6} value={form.message} onValue={set('message')} error={errors.message} required />
            {state.sent && (
              <Notice kind="info" title={t('contact.sentTitle')}>
                {t('contact.sent')}
              </Notice>
            )}
            {state.error && <p className="form-field__error" role="alert">{t(`errors.service.${state.error.code ?? 'unknown'}.body`)}</p>}
            <button type="submit" className="btn btn--primary" disabled={state.busy}>
              {state.busy ? t('account.sending') : t('contact.send')}
            </button>
          </form>
          <aside className="detail-side">
            <h2 className="side-heading">{t('contact.detailsTitle')}</h2>
            <Notice kind="info" title={t('contact.storedTitle')}>
              {t('contact.stored')}
            </Notice>
            <p className="muted">{t('contact.noDetails')}</p>
          </aside>
        </div>
      </section>
    </>
  );
}
