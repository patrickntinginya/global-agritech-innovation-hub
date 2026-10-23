import { useI18n } from '../i18n/index.jsx';

export default function LoadingState({ rows = 3 }) {
  const { t } = useI18n();
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <span className="visually-hidden">{t('loading')}</span>
      <div className="skeleton-grid" aria-hidden="true">
        {Array.from({ length: rows }, (_, i) => (
          <div className="skeleton" key={i} />
        ))}
      </div>
    </div>
  );
}
