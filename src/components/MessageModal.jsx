import { useState } from 'react';
import Modal from './Modal.jsx';
import Notice from './Notice.jsx';
import { TextField } from './forms.jsx';
import useValidation, { rules } from '../hooks/useValidation.js';
import { useI18n } from '../i18n/index.jsx';

const schema = { name: [rules.required], email: [rules.required, rules.email], message: [rules.required, rules.min(10)] };

// A validated "write to someone" form. Nothing is sent: it states that clearly after validation.
export default function MessageModal({ open, onClose, title, subtitle, noteKey }) {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [checked, setChecked] = useState(false);
  const { errors, validate, clearError } = useValidation(schema);
  const set = (k) => (v) => {
    setForm((f) => ({ ...f, [k]: v }));
    clearError(k);
  };
  return (
    <Modal open={open} onClose={onClose} title={title} titleId="message-title">
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setChecked(validate(form));
        }}
      >
        {subtitle && <p className="small muted">{subtitle}</p>}
        <TextField label={t('forms.name')} value={form.name} onValue={set('name')} error={errors.name} required autoComplete="name" />
        <TextField label={t('forms.email')} type="email" value={form.email} onValue={set('email')} error={errors.email} required autoComplete="email" />
        <TextField label={t('forms.message')} as="textarea" value={form.message} onValue={set('message')} error={errors.message} required />
        {checked && (
          <Notice kind="backend" title={t('ui.previewTitle')}>
            {t(noteKey)}
          </Notice>
        )}
        <div className="btn-row">
          <button type="submit" className="btn btn--primary">
            {t('experts.checkMessage')}
          </button>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            {t('actions.close')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
