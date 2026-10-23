import { useI18n } from '../i18n/index.jsx';
import { userRoles } from '../data/adminData.js';

// Radio group for the future user roles. Phase 1 stores the choice in component state only.
export default function RoleSelector({ value, onChange, name = 'role' }) {
  const { t } = useI18n();
  return (
    <fieldset className="role-select">
      <legend>{t('roles.legend')}</legend>
      <div className="role-select__grid">
        {userRoles.map((r) => (
          <label key={r} className={`role-option ${value === r ? 'is-selected' : ''}`}>
            <input type="radio" name={name} value={r} checked={value === r} onChange={() => onChange(r)} />
            <span className="role-option__title">{t(`roles.${r}`)}</span>
            <span className="role-option__desc">{t(`roleDescriptions.${r}`)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
