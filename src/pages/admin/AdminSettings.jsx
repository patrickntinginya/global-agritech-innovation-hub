import { useState } from 'react';
import DataLoader from '../../components/DataLoader.jsx';
import Notice from '../../components/Notice.jsx';
import { TextField } from '../../components/forms.jsx';
import usePageTitle from '../../hooks/usePageTitle.js';
import useAsync from '../../hooks/useAsync.js';
import useValidation, { rules } from '../../hooks/useValidation.js';
import { useI18n } from '../../i18n/index.jsx';
import { getSetting, saveSetting } from '../../services/adminService.js';
import { cleanText } from '../../services/accountService.js';

// Stored in public.site_settings (public read, admin write). Only values that are safe to show to everyone belong here.
const KINDS = {
  seo: {
    key: 'seo.default',
    defaults: { title: '', description: '' },
    schema: { title: [rules.required, rules.min(3)], description: [rules.required, rules.min(20)] },
    fields: [{ name: 'title' }, { name: 'description', textarea: true }],
  },
  platform: {
    key: 'platform.general',
    defaults: { contactEmail: '', bannerEn: '', bannerSw: '' },
    schema: { contactEmail: [rules.email] },
    fields: [{ name: 'contactEmail', type: 'email' }, { name: 'bannerEn' }, { name: 'bannerSw' }],
    toForm: (v) => ({ contactEmail: v.contactEmail ?? '', bannerEn: v.maintenanceBanner?.en ?? '', bannerSw: v.maintenanceBanner?.sw ?? '' }),
    toValue: (f) => ({ contactEmail: cleanText(f.contactEmail), maintenanceBanner: { en: cleanText(f.bannerEn), sw: cleanText(f.bannerSw) } }),
  },
};

function SettingsForm({ spec, initial }) {
  const { t } = useI18n();
  const [form, setForm] = useState(initial);
  const [state, setState] = useState({ busy: false, saved: false, error: null });
  const { errors, validate, clearError } = useValidation(spec.schema);
  const set = (k) => (v) => { setForm((f) => ({ ...f, [k]: v })); clearError(k); setState((s) => ({ ...s, saved: false, error: null })); };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate(form)) return;
    setState({ busy: true, saved: false, error: null });
    try {
      const value = spec.toValue ? spec.toValue(form) : Object.fromEntries(Object.entries(form).map(([k, v]) => [k, cleanText(v)]));
      await saveSetting(spec.key, value, true);
      setState({ busy: false, saved: true, error: null });
    } catch (error) {
      setState({ busy: false, saved: false, error });
    }
  };

  return (
    <form noValidate className="form-card" onSubmit={submit}>
      {spec.fields.map((f) => (
        <TextField key={f.name} label={t(`admin.set.${f.name}`)} as={f.textarea ? 'textarea' : 'input'} rows={3} type={f.type}
          value={form[f.name]} onValue={set(f.name)} error={errors[f.name]} required={Boolean(spec.schema[f.name]?.includes(rules.required))} />
      ))}
      {state.error && <p className="form-field__error" role="alert">{t(`errors.service.${state.error.code ?? 'unknown'}.body`)}</p>}
      {state.saved && <Notice kind="info" title={t('admin.set.savedTitle')}>{t('admin.set.saved')}</Notice>}
      <button type="submit" className="btn btn--primary" disabled={state.busy}>{state.busy ? t('account.saving') : t('adm.save')}</button>
    </form>
  );
}

export default function AdminSettings({ kind = 'platform' }) {
  const { t } = useI18n();
  const spec = KINDS[kind];
  usePageTitle(t(`admin.sections.${kind === 'seo' ? 'seo' : 'settings'}.title`));
  const result = useAsync(() => getSetting(spec.key), [kind]);
  const head = kind === 'seo' ? 'seo' : 'settings';
  return (
    <>
      <div className="admin-head"><div><h1>{t(`admin.sections.${head}.title`)}</h1><p className="muted">{t(`admin.sections.${head}.desc`)}</p></div></div>
      <div className="panel">
        <DataLoader result={result} rows={1}>
          {(value) => <SettingsForm key={kind} spec={spec} initial={value ? (spec.toForm ? spec.toForm(value) : { ...spec.defaults, ...value }) : spec.defaults} />}
        </DataLoader>
      </div>
    </>
  );
}
