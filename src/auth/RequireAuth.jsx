import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import LoadingState from '../components/LoadingState.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import { useI18n } from '../i18n/index.jsx';
import { useAuth } from './AuthContext.jsx';
import { decideAccess } from './authLogic.js';

// `standalone`: rendered outside the site layout (admin routes), so it supplies its own <main> landmark.
function AccessState({ titleKey, bodyKey, children, standalone = false }) {
  const { t } = useI18n();
  usePageTitle(t(titleKey));
  const Tag = standalone ? 'main' : 'div';
  return (
    <Tag className="container page-center" role="alert" id={standalone ? 'main' : undefined}>
      <h1>{t(titleKey)}</h1>
      <p>{t(bodyKey)}</p>
      <div className="btn-row btn-row--center">
        {children}
        <Link to="/" className="btn btn--ghost">{t('actions.backHome')}</Link>
      </div>
    </Tag>
  );
}

// Wraps routes that need a signed-in member (admin = true: an administrator). The UI decision only chooses what to
// show. Real protection is in the database: policies reject the request even if someone opens an admin URL by hand.
export default function RequireAuth({ admin = false }) {
  const { status, isAdmin, expired } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  const decision = decideAccess({ status, isAdmin, requireAdmin: admin });

  if (decision === 'loading') return <div className="container section"><LoadingState rows={2} /></div>;
  if (decision === 'unconfigured') {
    return <AccessState titleKey="account.notConfiguredTitle" bodyKey="account.notConfiguredBody" standalone={admin} />;
  }
  if (decision === 'forbidden') {
    return <AccessState titleKey="account.forbiddenTitle" bodyKey="account.forbiddenBody" standalone={admin} />;
  }
  if (decision === 'signin') {
    const next = `${location.pathname}${location.search}`;
    if (expired) {
      return (
        <AccessState titleKey="account.expiredTitle" bodyKey="account.expiredBody" standalone={admin}>
          <Link to={`/signin?next=${encodeURIComponent(next)}`} className="btn btn--primary">{t('actions.signIn')}</Link>
        </AccessState>
      );
    }
    return <Navigate to={`/signin?next=${encodeURIComponent(next)}`} replace />;
  }
  return <Outlet />;
}
