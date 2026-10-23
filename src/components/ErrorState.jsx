import { useI18n } from '../i18n/index.jsx';

export default function ErrorState({ onRetry }) {
  const { t } = useI18n();
  return (
    <div className="empty-state empty-state--error" role="alert">
      <h3>{t('ui.errorTitle')}</h3>
      <p>{t('ui.errorBody')}</p>
      {onRetry && (
        <button type="button" className="btn btn--primary btn--sm" onClick={onRetry}>
          {t('ui.retry')}
        </button>
      )}
    </div>
  );
}
