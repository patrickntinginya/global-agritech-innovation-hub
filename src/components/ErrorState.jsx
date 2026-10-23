import { useI18n } from '../i18n/index.jsx';

// Shows a specific, translated reason when the error is a ServiceError (not configured, permission denied,
// session expired, network ...). Raw error text is never shown.
export default function ErrorState({ error, onRetry }) {
  const { t } = useI18n();
  const code = error?.code && ['not_configured', 'permission_denied', 'session_expired', 'network', 'not_found', 'conflict', 'validation'].includes(error.code) ? error.code : 'unknown';
  return (
    <div className="empty-state empty-state--error" role="alert">
      <h3>{t(`errors.service.${code}.title`)}</h3>
      <p>{t(`errors.service.${code}.body`)}</p>
      {onRetry && code !== 'not_configured' && (
        <button type="button" className="btn btn--primary btn--sm" onClick={onRetry}>
          {t('ui.retry')}
        </button>
      )}
    </div>
  );
}
