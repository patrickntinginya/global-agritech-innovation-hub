import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { useI18n } from '../i18n/index.jsx';

// Header buttons: Sign In / Join the Hub for visitors; Dashboard (+ Admin) and Sign out for members.
export default function AccountActions({ className = '' }) {
  const { t } = useI18n();
  const { status, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  if (status === 'signedIn') {
    return (
      <>
        {isAdmin && <NavLink to="/admin" className={`btn btn--ghost ${className}`}>{t('account.adminLink')}</NavLink>}
        <NavLink to="/dashboard" className={`btn btn--ghost ${className}`}>{t('account.dashboard')}</NavLink>
        <button
          type="button"
          className={`btn btn--accent ${className}`}
          onClick={async () => { const r = await signOut(); if (r.ok) navigate('/'); }}
        >
          {t('account.signOut')}
        </button>
      </>
    );
  }
  return (
    <>
      <NavLink to="/signin" className={`btn btn--ghost ${className}`}>{t('actions.signIn')}</NavLink>
      <NavLink to="/register" className={`btn btn--accent ${className}`}>{t('actions.join')}</NavLink>
    </>
  );
}
