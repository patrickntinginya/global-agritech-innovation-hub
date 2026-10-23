import { useState } from 'react';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import Notice from '../../components/Notice.jsx';
import { SelectField, TextField } from '../../components/forms.jsx';
import usePageTitle from '../../hooks/usePageTitle.js';
import useValidation, { rules } from '../../hooks/useValidation.js';
import { useI18n } from '../../i18n/index.jsx';
import { broadcastNotification } from '../../services/adminService.js';
import { cleanText } from '../../services/accountService.js';

const schema = { titleEn: [rules.required], titleSw: [rules.required], bodyEn: [rules.required, rules.min(10)], bodySw: [rules.required, rules.min(10)] };
const blank = { kind: 'system', titleEn: '', titleSw: '', bodyEn: '', bodySw: '', link: '' };
const KINDS = ['system', 'content', 'community', 'learning'];

// Sends a real notification to every member whose preferences allow that kind. The count shown comes from the database.
export default function AdminNotifications() {
  const { t } = useI18n();
  usePageTitle(t('admin.sections.notifications.title'));
  const [form, setForm] = useState(blank);
  const [confirming, setConfirming] = useState(false);
  const [state, setState] = useState({ busy: false, sent: null, error: null });
  const { errors, validate, clearError } = useValidation(schema);
  const set = (k) => (v) => { setForm((f) => ({ ...f, [k]: v })); clearError(k); setState((s) => ({ ...s, sent: null, error: null })); };

  const review = (e) => {
    e.preventDefault();
    const link = form.link.trim();
    if (!validate(form)) return;
    if (link && !/^\/[^\s]*$/.test(link)) { setState({ busy: false, sent: null, error: { code: 'validation' } }); return; }
    setConfirming(true);
  };

  const send = async () => {
    setConfirming(false);
    setState({ busy: true, sent: null, error: null });
    try {
      const n = await broadcastNotification({
        kind: form.kind, title: { en: cleanText(form.titleEn), sw: cleanText(form.titleSw) },
        body: { en: cleanText(form.bodyEn), sw: cleanText(form.bodySw) }, link: form.link.trim(),
      });
      setState({ busy: false, sent: n, error: null });
      setForm(blank);
    } catch (error) {
      setState({ busy: false, sent: null, error });
    }
  };

  return (
    <>
      <div className="admin-head"><div><h1>{t('admin.sections.notifications.title')}</h1><p className="muted">{t('admin.sections.notifications.desc')}</p></div></div>
      <Notice kind="backend" title={t('admin.notify.emailTitle')}>{t('admin.notify.emailNote')}</Notice>
      <form noValidate className="form-card" onSubmit={review}>
        <SelectField label={t('admin.notify.kind')} value={form.kind} onValue={set('kind')} options={KINDS.map((k) => ({ value: k, label: t(`notifications.kinds.${k}`) }))} />
        <TextField label={t('admin.notify.titleEn')} value={form.titleEn} onValue={set('titleEn')} error={errors.titleEn} required />
        <TextField label={t('admin.notify.titleSw')} value={form.titleSw} onValue={set('titleSw')} error={errors.titleSw} required />
        <TextField label={t('admin.notify.bodyEn')} as="textarea" rows={3} value={form.bodyEn} onValue={set('bodyEn')} error={errors.bodyEn} required />
        <TextField label={t('admin.notify.bodySw')} as="textarea" rows={3} value={form.bodySw} onValue={set('bodySw')} error={errors.bodySw} required />
        <TextField label={t('admin.notify.link')} hint={t('admin.notify.linkHint')} value={form.link} onValue={set('link')} />
        {state.error && <p className="form-field__error" role="alert">{t(`errors.service.${state.error.code ?? 'unknown'}.body`)}</p>}
        {state.sent !== null && <Notice kind="info" title={t('admin.notify.sentTitle')}>{t('admin.notify.sent', { n: state.sent })}</Notice>}
        <button type="submit" className="btn btn--primary" disabled={state.busy}>{state.busy ? t('account.sending') : t('admin.notify.review')}</button>
      </form>
      <ConfirmDialog open={confirming} title={t('admin.notify.confirmTitle')} body={t('admin.notify.confirmBody')} confirmLabel={t('admin.notify.send')} onConfirm={send} onClose={() => setConfirming(false)} />
    </>
  );
}
