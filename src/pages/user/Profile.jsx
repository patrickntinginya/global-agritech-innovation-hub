import { useState } from 'react';
import Notice from '../../components/Notice.jsx';
import RoleSelector from '../../components/RoleSelector.jsx';
import { TextField, CheckboxField } from '../../components/forms.jsx';
import usePageTitle from '../../hooks/usePageTitle.js';
import useValidation, { rules } from '../../hooks/useValidation.js';
import { useI18n } from '../../i18n/index.jsx';
import { demoUserProfile } from '../../data/adminData.js';
import { categories } from '../../data/categories.js';

const schema = { displayName: [rules.required], country: [rules.required] };

export default function Profile() {
  const { t, loc } = useI18n();
  usePageTitle(t('user.nav.profile'));
  const [form, setForm] = useState({ displayName: demoUserProfile.displayName, role: demoUserProfile.role, country: demoUserProfile.country, bio: '', interests: demoUserProfile.interests });
  const [checked, setChecked] = useState(false);
  const { errors, validate, clearError } = useValidation(schema);
  const set = (k) => (v) => {
    setForm((f) => ({ ...f, [k]: v }));
    clearError(k);
    setChecked(false);
  };
  const toggleInterest = (id) => set('interests')(form.interests.includes(id) ? form.interests.filter((x) => x !== id) : [...form.interests, id]);

  return (
    <>
      <h1>{t('user.nav.profile')}</h1>
      <p className="lede">{t('profile.desc')}</p>
      <form
        noValidate
        className="form-card"
        onSubmit={(e) => {
          e.preventDefault();
          setChecked(validate(form));
        }}
      >
        <TextField label={t('profile.displayName')} value={form.displayName} onValue={set('displayName')} error={errors.displayName} required />
        <TextField label={t('user.country')} value={form.country} onValue={set('country')} error={errors.country} required autoComplete="country-name" />
        <RoleSelector value={form.role} onChange={set('role')} />
        <TextField label={t('profile.bio')} as="textarea" rows={4} value={form.bio} onValue={set('bio')} />
        <fieldset className="check-group">
          <legend>{t('user.interests')}</legend>
          <div className="check-group__grid">
            {categories.map((c) => (
              <CheckboxField key={c.id} label={loc(c.title)} checked={form.interests.includes(c.id)} onValue={() => toggleInterest(c.id)} />
            ))}
          </div>
        </fieldset>
        {checked && (
          <Notice kind="backend" title={t('ui.previewTitle')}>
            {t('profile.previewNote')}
          </Notice>
        )}
        <button type="submit" className="btn btn--primary">
          {t('profile.preview')}
        </button>
      </form>
    </>
  );
}
