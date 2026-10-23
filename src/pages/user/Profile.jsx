import { useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle.js';
import useAsync from '../../hooks/useAsync.js';
import useValidation, { rules } from '../../hooks/useValidation.js';
import DataLoader from '../../components/DataLoader.jsx';
import Notice from '../../components/Notice.jsx';
import RoleSelector from '../../components/RoleSelector.jsx';
import { TextField, CheckboxField } from '../../components/forms.jsx';
import { useI18n } from '../../i18n/index.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { getMyProfile, updateMyProfile } from '../../services/accountService.js';
import { categories } from '../../data/categories.js';

const schema = { displayName: [rules.required] };

function ProfileForm({ profile, userId }) {
  const { t, loc } = useI18n();
  const [form, setForm] = useState({ displayName: profile.displayName, role: profile.role, country: profile.country, bio: profile.bio, interests: profile.interests });
  const [status, setStatus] = useState({ busy: false, saved: false, error: null });
  const { errors, validate, clearError } = useValidation(schema);
  const set = (k) => (v) => { setForm((f) => ({ ...f, [k]: v })); clearError(k); setStatus((s) => ({ ...s, saved: false })); };
  const toggleInterest = (id) => set('interests')(form.interests.includes(id) ? form.interests.filter((x) => x !== id) : [...form.interests, id]);

  const submit = async (e) => {
    e.preventDefault();
    if (!validate(form)) return;
    setStatus({ busy: true, saved: false, error: null });
    try {
      await updateMyProfile(userId, form);
      setStatus({ busy: false, saved: true, error: null });
    } catch (err) {
      // A failed save is reported as a failure; success is only shown after the database confirmed the update.
      setStatus({ busy: false, saved: false, error: err });
    }
  };

  return (
    <form noValidate className="form-card" onSubmit={submit}>
      <TextField label={t('profile.displayName')} value={form.displayName} onValue={set('displayName')} error={errors.displayName} required maxLength={80} />
      <TextField label={t('user.country')} value={form.country} onValue={set('country')} error={errors.country} autoComplete="country-name" maxLength={80} />
      <RoleSelector value={form.role} onChange={set('role')} />
      <TextField label={t('profile.bio')} as="textarea" rows={4} value={form.bio} onValue={set('bio')} maxLength={500} />
      <fieldset className="check-group">
        <legend>{t('user.interests')}</legend>
        <div className="check-group__grid">
          {categories.map((c) => (
            <CheckboxField key={c.id} label={loc(c.title)} checked={form.interests.includes(c.id)} onValue={() => toggleInterest(c.id)} />
          ))}
        </div>
      </fieldset>
      {status.saved && <Notice kind="info" title={t('profile.savedTitle')}>{t('profile.saved')}</Notice>}
      {status.error && <p className="form-field__error" role="alert">{t(`errors.service.${status.error.code ?? 'unknown'}.body`)}</p>}
      <button type="submit" className="btn btn--primary" disabled={status.busy}>{status.busy ? t('account.saving') : t('profile.save')}</button>
    </form>
  );
}

export default function Profile() {
  const { t } = useI18n();
  usePageTitle(t('user.nav.profile'));
  const { user } = useAuth();
  const result = useAsync(() => getMyProfile(user.id), [user.id]);
  return (
    <>
      <h1>{t('user.nav.profile')}</h1>
      <p className="lede">{t('profile.desc')}</p>
      <DataLoader result={result} rows={2}>
        {(profile) => (profile ? <ProfileForm profile={profile} userId={user.id} /> : <Notice kind="backend" title={t('profile.missingTitle')}>{t('profile.missing')}</Notice>)}
      </DataLoader>
    </>
  );
}
