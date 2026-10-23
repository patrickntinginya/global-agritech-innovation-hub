import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import PreviewForm from '../components/PreviewForm.jsx';
import PrototypeNotice from '../components/PrototypeNotice.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import { useI18n } from '../i18n/index.jsx';
import { userRoles } from '../data/discussions.js';

// Sign In and Registration are UI prototypes. Nothing is sent, no account is created, and
// password values are cleared from the form on submit and never stored.
export function SignIn() {
  const { t } = useI18n();
  usePageTitle(t('actions.signIn'));
  const fields = [
    { name: 'email', labelKey: 'forms.email', type: 'email', autoComplete: 'email' },
    { name: 'password', labelKey: 'forms.password', type: 'password', autoComplete: 'current-password' },
  ];
  return (
    <>
      <PageHeader title={t('actions.signIn')} description={t('auth.signInDesc')} crumbs={[{ label: t('actions.signIn') }]} />
      <div className="container page-body narrow">
        <PrototypeNotice kind="auth" />
        <PreviewForm fields={fields} rules={{ email: ['required', 'email'], password: ['required'] }}
          submitLabel={t('actions.signIn')} resultKey="auth.signInResult" clearOnSubmit={['password']} />
        <p>{t('auth.noAccount')} <Link to="/register">{t('actions.join')}</Link></p>
        <p><Link to="/dashboard">{t('auth.viewDashboardPreview')}</Link></p>
      </div>
    </>
  );
}

export function Register() {
  const { t } = useI18n();
  usePageTitle(t('actions.join'));
  const fields = [
    { name: 'name', labelKey: 'forms.yourName', autoComplete: 'name' },
    { name: 'email', labelKey: 'forms.email', type: 'email', autoComplete: 'email' },
    { name: 'role', labelKey: 'auth.role', type: 'select', hintKey: 'auth.roleHint', options: userRoles.map((r) => ({ value: r, label: t(`roles.${r}`) })) },
    { name: 'password', labelKey: 'forms.password', type: 'password', autoComplete: 'new-password', hintKey: 'auth.passwordHint' },
    { name: 'confirm', labelKey: 'forms.confirmPassword', type: 'password', autoComplete: 'new-password' },
    { name: 'consent', labelKey: 'auth.consent', type: 'checkbox' },
  ];
  const rules = {
    name: ['required'], email: ['required', 'email'], role: ['required'],
    password: ['required', { min: 8 }], confirm: ['required', { match: 'password' }], consent: ['required'],
  };
  return (
    <>
      <PageHeader title={t('actions.join')} description={t('auth.registerDesc')} crumbs={[{ label: t('actions.join') }]} />
      <div className="container page-body narrow">
        <PrototypeNotice kind="auth" />
        <PreviewForm fields={fields} rules={rules} submitLabel={t('auth.createPreview')} resultKey="auth.registerResult" clearOnSubmit={['password', 'confirm']} />
        <p>{t('auth.haveAccount')} <Link to="/signin">{t('actions.signIn')}</Link></p>
      </div>
    </>
  );
}
