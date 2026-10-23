import { Link } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle.js';
import { useI18n } from '../i18n/index.jsx';

export default function NotFound() {
  const { t } = useI18n();
  usePageTitle(t('notFound.title'));
  return (
    <div className="container page-center">
      <p className="badge-pill">404</p>
      <h1>{t('notFound.title')}</h1>
      <p>{t('notFound.body')}</p>
      <div className="btn-row btn-row--center">
        <Link to="/" className="btn btn--primary">
          {t('actions.backHome')}
        </Link>
        <Link to="/search" className="btn btn--ghost">
          {t('actions.search')}
        </Link>
      </div>
    </div>
  );
}
