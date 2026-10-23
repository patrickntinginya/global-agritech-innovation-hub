import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import Notice from '../components/Notice.jsx';
import { TextField, SelectField, CheckboxField } from '../components/forms.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import useValidation, { rules } from '../hooks/useValidation.js';
import { useI18n } from '../i18n/index.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { safeNext } from '../auth/authLogic.js';
import { isBackendConfigured } from '../lib/config.js';
import { userRoles } from '../data/taxonomies.js';

function Unconfigured() {
  const { t } = useI18n();
  return (
    <Notice kind="backend" title={t('account.notConfiguredTitle')}>
      {t('account.notConfiguredBody')}
    </Notice>
  );
}

function Shell({ title, description, crumb, children }) {
  usePageTitle(title);
  return (
    <>
      <PageHeader title={title} description={description} crumbs={[{ label: crumb ?? title }]} />
      <div className="container page-body narrow">{children}</div>
    </>
  );
}

// ---------------------------------------------------------------------------------------------------- sign in
const signInSchema = { email: [rules.required, rules.email], password: [rules.required] };

export function SignIn() {
  const { t } = useI18n();
  const { status, signIn } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const next = safeNext(params.get('next'));
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState('');
  const { errors, validate, clearError } = useValidation(signInSchema);
  const set = (k) => (v) => { setForm((f) => ({ ...f, [k]: v })); clearError(k); setFailure(''); };

  if (status === 'signedIn') return <Navigate to={next} replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (!validate(form)) return;
    setBusy(true);
    const result = await signIn(form);
    setBusy(false);
    setForm((f) => ({ ...f, password: '' }));
    if (result.ok) navigate(next, { replace: true });
    else setFailure(result.errorKey);
  };

  return (
    <Shell title={t('actions.signIn')} description={t('account.signInDesc')}>
      {!isBackendConfigured() && <Unconfigured />}
      <form noValidate className="form-card" onSubmit={submit}>
        {failure && <p className="form-field__error" role="alert">{t(failure)}</p>}
        <TextField label={t('forms.email')} type="email" value={form.email} onValue={set('email')} error={errors.email} required autoComplete="email" />
        <TextField label={t('forms.password')} type="password" value={form.password} onValue={set('password')} error={errors.password} required autoComplete="current-password" />
        <button type="submit" className="btn btn--primary" disabled={busy || !isBackendConfigured()}>
          {busy ? t('account.signingIn') : t('actions.signIn')}
        </button>
        <p><Link to="/forgot-password">{t('account.forgot')}</Link></p>
      </form>
      <p>{t('account.noAccount')} <Link to="/register">{t('actions.join')}</Link></p>
    </Shell>
  );
}

// ---------------------------------------------------------------------------------------------------- register
const registerSchema = {
  name: [rules.required],
  email: [rules.required, rules.email],
  role: [rules.required],
  password: [rules.required, rules.min(8)],
  confirm: [rules.required, rules.match('password')],
  consent: [(v) => (v ? null : 'ui.errors.consent')],
};

export function Register() {
  const { t, lang, loc } = useI18n();
  const { status, signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', role: '', password: '', confirm: '', consent: false });
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState('');
  const [done, setDone] = useState(false);
  const { errors, validate, clearError } = useValidation(registerSchema);
  const set = (k) => (v) => { setForm((f) => ({ ...f, [k]: v })); clearError(k); setFailure(''); };

  if (status === 'signedIn' && !done) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (!validate(form)) return;
    setBusy(true);
    const result = await signUp({ email: form.email, password: form.password, displayName: form.name, accountType: form.role, language: lang });
    setBusy(false);
    // The password never stays in component state after the request.
    setForm((f) => ({ ...f, password: '', confirm: '' }));
    if (!result.ok) { setFailure(result.errorKey); return; }
    if (result.needsConfirmation) setDone(true);
    else navigate('/dashboard', { replace: true });
  };

  if (done) {
    return (
      <Shell title={t('actions.join')} description={t('account.registerDesc')}>
        <Notice kind="info" title={t('account.checkEmailTitle')}>{t('account.checkEmailBody')}</Notice>
        <p><Link to="/signin" className="btn btn--primary">{t('actions.signIn')}</Link></p>
      </Shell>
    );
  }

  return (
    <Shell title={t('actions.join')} description={t('account.registerDesc')}>
      {!isBackendConfigured() && <Unconfigured />}
      <form noValidate className="form-card" onSubmit={submit}>
        {failure && <p className="form-field__error" role="alert">{t(failure)}</p>}
        <TextField label={t('forms.yourName')} value={form.name} onValue={set('name')} error={errors.name} required autoComplete="name" />
        <TextField label={t('forms.email')} type="email" value={form.email} onValue={set('email')} error={errors.email} required autoComplete="email" />
        <SelectField
          label={t('auth.role')} hint={t('auth.roleHint')} value={form.role} onValue={set('role')} error={errors.role} required
          placeholder={t('common.choose')} options={userRoles.map((r) => ({ value: r.id, label: loc(r.label) }))}
        />
        <TextField label={t('forms.password')} hint={t('auth.passwordHint')} type="password" value={form.password} onValue={set('password')} error={errors.password} required autoComplete="new-password" />
        <TextField label={t('forms.confirmPassword')} type="password" value={form.confirm} onValue={set('confirm')} error={errors.confirm} required autoComplete="new-password" />
        <CheckboxField label={t('account.consent')} checked={form.consent} onValue={set('consent')} />
        {errors.consent && <p className="form-field__error" role="alert">{t(errors.consent)}</p>}
        <button type="submit" className="btn btn--primary" disabled={busy || !isBackendConfigured()}>
          {busy ? t('account.creating') : t('account.createAccount')}
        </button>
      </form>
      <p>{t('account.haveAccount')} <Link to="/signin">{t('actions.signIn')}</Link></p>
    </Shell>
  );
}

// ---------------------------------------------------------------------------------------------------- forgot / reset
const forgotSchema = { email: [rules.required, rules.email] };

export function ForgotPassword() {
  const { t } = useI18n();
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState('');
  const [sent, setSent] = useState(false);
  const { errors, validate, clearError } = useValidation(forgotSchema);

  const submit = async (e) => {
    e.preventDefault();
    if (!validate({ email })) return;
    setBusy(true);
    const result = await requestPasswordReset(email);
    setBusy(false);
    if (result.ok) setSent(true);
    else setFailure(result.errorKey);
  };

  return (
    <Shell title={t('account.forgotTitle')} description={t('account.forgotDesc')}>
      {!isBackendConfigured() && <Unconfigured />}
      {sent ? (
        // The same message is shown whether or not the address has an account, so the form cannot be used to find out.
        <Notice kind="info" title={t('account.linkSentTitle')}>{t('account.linkSent')}</Notice>
      ) : (
        <form noValidate className="form-card" onSubmit={submit}>
          {failure && <p className="form-field__error" role="alert">{t(failure)}</p>}
          <TextField label={t('forms.email')} type="email" value={email} onValue={(v) => { setEmail(v); clearError('email'); setFailure(''); }} error={errors.email} required autoComplete="email" />
          <button type="submit" className="btn btn--primary" disabled={busy || !isBackendConfigured()}>
            {busy ? t('account.sending') : t('account.sendLink')}
          </button>
        </form>
      )}
      <p><Link to="/signin">{t('account.backToSignIn')}</Link></p>
    </Shell>
  );
}

const resetSchema = { password: [rules.required, rules.min(8)], confirm: [rules.required, rules.match('password')] };

export function ResetPassword() {
  const { t } = useI18n();
  const { status, updatePassword } = useAuth();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState('');
  const [done, setDone] = useState(false);
  const { errors, validate, clearError } = useValidation(resetSchema);
  const set = (k) => (v) => { setForm((f) => ({ ...f, [k]: v })); clearError(k); setFailure(''); };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate(form)) return;
    setBusy(true);
    const result = await updatePassword(form.password);
    setBusy(false);
    setForm({ password: '', confirm: '' });
    if (result.ok) setDone(true);
    else setFailure(result.errorKey);
  };

  let body;
  if (done) {
    body = (
      <>
        <Notice kind="info" title={t('account.passwordUpdated')}>{t('account.passwordUpdatedBody')}</Notice>
        <p><Link to="/dashboard" className="btn btn--primary">{t('account.dashboard')}</Link></p>
      </>
    );
  } else if (status === 'loading') {
    body = <p className="muted">{t('loading')}</p>;
  } else if (status !== 'signedIn') {
    // The recovery email link opens a short-lived session. Without one, the link was already used or has expired.
    body = (
      <>
        <Notice kind="backend" title={t('account.resetInvalidTitle')}>{t('account.resetInvalid')}</Notice>
        <p><Link to="/forgot-password" className="btn btn--primary">{t('account.forgotTitle')}</Link></p>
      </>
    );
  } else {
    body = (
      <form noValidate className="form-card" onSubmit={submit}>
        {failure && <p className="form-field__error" role="alert">{t(failure)}</p>}
        <TextField label={t('account.newPassword')} hint={t('auth.passwordHint')} type="password" value={form.password} onValue={set('password')} error={errors.password} required autoComplete="new-password" />
        <TextField label={t('forms.confirmPassword')} type="password" value={form.confirm} onValue={set('confirm')} error={errors.confirm} required autoComplete="new-password" />
        <button type="submit" className="btn btn--primary" disabled={busy}>{busy ? t('account.saving') : t('account.savePassword')}</button>
      </form>
    );
  }
  return <Shell title={t('account.resetTitle')} description={t('account.resetDesc')}>{body}</Shell>;
}
