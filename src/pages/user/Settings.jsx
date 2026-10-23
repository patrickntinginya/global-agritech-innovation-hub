import { useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle.js';
import useAsync from '../../hooks/useAsync.js';
import DataLoader from '../../components/DataLoader.jsx';
import Notice from '../../components/Notice.jsx';
import { SelectField, CheckboxField } from '../../components/forms.jsx';
import { LANGUAGES, useI18n } from '../../i18n/index.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { getMyProfile, updateMyProfile } from '../../services/accountService.js';

function NotificationPrefs({ profile, userId }) {
  const { t } = useI18n();
  const [prefs, setPrefs] = useState(profile.notify);
  const [status, setStatus] = useState({ busy: false, saved: false, error: null });
  const toggle = (k) => (v) => { setPrefs((p) => ({ ...p, [k]: v })); setStatus((s) => ({ ...s, saved: false })); };
  const submit = async (e) => {
    e.preventDefault();
    setStatus({ busy: true, saved: false, error: null });
    try {
      await updateMyProfile(userId, { notify: prefs });
      setStatus({ busy: false, saved: true, error: null });
    } catch (err) {
      setStatus({ busy: false, saved: false, error: err });
    }
  };
  return (
    <form className="form-card" aria-labelledby="set-notif" onSubmit={submit}>
      <h2 id="set-notif">{t('settings.notificationsTitle')}</h2>
      <p className="muted">{t('settings.deliveryNote')}</p>
      <CheckboxField label={t('settings.notifContent')} checked={prefs.content} onValue={toggle('content')} />
      <CheckboxField label={t('settings.notifCommunity')} checked={prefs.community} onValue={toggle('community')} />
      <CheckboxField label={t('settings.notifLearning')} checked={prefs.learning} onValue={toggle('learning')} />
      {status.saved && <Notice kind="info" title={t('profile.savedTitle')}>{t('settings.saved')}</Notice>}
      {status.error && <p className="form-field__error" role="alert">{t(`errors.service.${status.error.code ?? 'unknown'}.body`)}</p>}
      <button type="submit" className="btn btn--primary" disabled={status.busy}>{status.busy ? t('account.saving') : t('settings.save')}</button>
    </form>
  );
}

export default function Settings() {
  const { t, lang, setLang } = useI18n();
  usePageTitle(t('user.nav.settings'));
  const { user, requestPasswordReset } = useAuth();
  const result = useAsync(() => getMyProfile(user.id), [user.id]);
  const [langError, setLangError] = useState(null);
  const [reset, setReset] = useState({ busy: false, sent: false, error: '' });

  const changeLanguage = async (code) => {
    setLang(code);
    setLangError(null);
    try {
      await updateMyProfile(user.id, { language: code });
    } catch (err) {
      setLangError(err);
    }
  };
  const sendReset = async () => {
    setReset({ busy: true, sent: false, error: '' });
    const r = await requestPasswordReset(user.email);
    setReset({ busy: false, sent: r.ok, error: r.ok ? '' : r.errorKey });
  };

  return (
    <>
      <h1>{t('user.nav.settings')}</h1>
      <section className="form-card" aria-labelledby="set-lang">
        <h2 id="set-lang">{t('settings.languageTitle')}</h2>
        <p className="muted">{t('settings.languageBody')}</p>
        <SelectField label={t('a11y.language')} value={lang} onValue={changeLanguage} options={LANGUAGES.map((l) => ({ value: l.code, label: l.label }))} />
        {langError && <p className="form-field__error" role="alert">{t('settings.languageNotSaved')}</p>}
      </section>
      <DataLoader result={result} rows={1}>{(profile) => (profile ? <NotificationPrefs profile={profile} userId={user.id} /> : null)}</DataLoader>
      <section className="form-card" aria-labelledby="set-account">
        <h2 id="set-account">{t('settings.accountTitle')}</h2>
        <p className="muted">{t('settings.emailLine', { email: user.email })}</p>
        <p className="muted">{t('settings.passwordBody')}</p>
        <div className="btn-row">
          <button type="button" className="btn btn--ghost" onClick={sendReset} disabled={reset.busy}>{reset.busy ? t('account.sending') : t('settings.changePassword')}</button>
        </div>
        {reset.sent && <Notice kind="info" title={t('account.linkSentTitle')}>{t('settings.resetSent')}</Notice>}
        {reset.error && <p className="form-field__error" role="alert">{t(reset.error)}</p>}
        <p className="muted small">{t('settings.deleteNote')}</p>
      </section>
    </>
  );
}
