import { useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import Notice from '../components/Notice.jsx';
import { TextField, SelectField } from '../components/forms.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import useValidation, { rules } from '../hooks/useValidation.js';
import { useI18n } from '../i18n/index.jsx';

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
  const [checked, setChecked] = useState(false);
  const { errors, validate, clearError } = useValidation(schema);
  const set = (k) => (v) => {
    setForm((f) => ({ ...f, [k]: v }));
    clearError(k);
    setChecked(false);
  };
  return (
    <>
      <PageHeader title={t('footer.contact')} description={t('contact.desc')} crumbs={[{ label: t('nav.home'), to: '/' }, { label: t('footer.contact') }]} />
      <section className="section section--compact">
        <div className="container contact-grid">
          <form
            noValidate
            className="form-card"
            onSubmit={(e) => {
              e.preventDefault();
              setChecked(validate(form));
            }}
          >
            <TextField label={t('forms.name')} value={form.name} onValue={set('name')} error={errors.name} required autoComplete="name" />
            <TextField label={t('forms.email')} type="email" value={form.email} onValue={set('email')} error={errors.email} required autoComplete="email" />
            <SelectField label={t('contact.reason')} value={form.reason} onValue={set('reason')} options={reasons.map((r) => ({ value: r, label: t(`contact.reasons.${r}`) }))} />
            <TextField label={t('contact.subject')} value={form.subject} onValue={set('subject')} error={errors.subject} required />
            <TextField label={t('forms.message')} as="textarea" rows={6} value={form.message} onValue={set('message')} error={errors.message} required />
            {checked && (
              <Notice kind="backend" title={t('ui.previewTitle')}>
                {t('contact.previewNote')}
              </Notice>
            )}
            <button type="submit" className="btn btn--primary">
              {t('contact.check')}
            </button>
          </form>
          <aside className="detail-side">
            <h2 className="side-heading">{t('contact.detailsTitle')}</h2>
            <Notice kind="backend" title={t('contact.noticeTitle')}>
              {t('contact.notice')}
            </Notice>
            <p className="muted">{t('contact.noDetails')}</p>
          </aside>
        </div>
      </section>
    </>
  );
}
