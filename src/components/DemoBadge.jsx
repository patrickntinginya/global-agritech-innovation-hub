import { useI18n } from '../i18n/index.jsx';

export default function DemoBadge({ compact = false }) {
  const { t } = useI18n();
  return (
    <span className="demo-badge" title={t('demo.note')}>
      {compact ? t('demo.short') : t('demo.badge')}
    </span>
  );
}
