import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/index.jsx';

export default function Logo({ onNavigate }) {
  const { t } = useI18n();
  return (
    <Link to="/" className="logo" onClick={onNavigate} aria-label={t('brand.name')}>
      <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <rect width="32" height="32" rx="8" fill="#17402B" />
        <path d="M16 26V14M16 14c0-4 3-7 8-7 0 4-3 7-8 7ZM16 18c0-3-2-5-6-5 0 3 2 5 6 5Z" fill="none" stroke="#E5B320" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="logo__text">
        <strong>Global AgriTech</strong>
        <span>Innovation Hub</span>
      </span>
    </Link>
  );
}
