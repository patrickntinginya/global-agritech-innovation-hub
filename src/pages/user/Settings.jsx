import { useState } from 'react';
import Notice from '../../components/Notice.jsx';
import { SelectField, CheckboxField } from '../../components/forms.jsx';
import usePageTitle from '../../hooks/usePageTitle.js';
import { LANGUAGES, useI18n } from '../../i18n/index.jsx';

export default function Settings() {
  const { t, lang, setLang } = useI18n();
  usePageTitle(t('user.nav.settings'));
  const [prefs, setPrefs] = useState({ content: true, community: true, learning: false });
  const [checked, setChecked] = useState(false);
  const toggle = (k) => (v) => {
    setPrefs((p) => ({ ...p, [k]: v }));
    setChecked(false);
  };
  return (
    <>
      <h1>{t('user.nav.settings')}</h1>
      <section className="form-card" aria-labelledby="set-lang">
        <h2 id="set-lang">{t('settings.languageTitle')}</h2>
        <p className="muted">{t('settings.languageBody')}</p>
        <SelectField label={t('a11y.language')} value={lang} onValue={setLang} options={LANGUAGES.map((l) => ({ value: l.code, label: l.label }))} />
      </section>
      <form
        className="form-card"
        aria-labelledby="set-notif"
        onSubmit={(e) => {
          e.preventDefault();
          setChecked(true);
        }}
      >
        <h2 id="set-notif">{t('settings.notificationsTitle')}</h2>
        <CheckboxField label={t('settings.notifContent')} checked={prefs.content} onValue={toggle('content')} />
        <CheckboxField label={t('settings.notifCommunity')} checked={prefs.community} onValue={toggle('community')} />
        <CheckboxField label={t('settings.notifLearning')} checked={prefs.learning} onValue={toggle('learning')} />
        {checked && (
          <Notice kind="backend" title={t('ui.previewTitle')}>
            {t('settings.previewNote')}
          </Notice>
        )}
        <button type="submit" className="btn btn--primary">
          {t('settings.preview')}
        </button>
      </form>
      <section className="form-card" aria-labelledby="set-account">
        <h2 id="set-account">{t('settings.accountTitle')}</h2>
        <p className="muted">{t('settings.accountBody')}</p>
        <div className="btn-row">
          <button type="button" className="btn btn--ghost" disabled>
            {t('settings.changePassword')}
          </button>
          <button type="button" className="btn btn--danger" disabled>
            {t('settings.deleteAccount')}
          </button>
        </div>
      </section>
    </>
  );
}
