import { hasSampleContent } from '../lib/sampleContent.js';
import { useI18n } from '../i18n/index.jsx';

export default function DemoBadge({ compact = false }) {
  const { t } = useI18n();
  if (!hasSampleContent()) return null;
  return (
    <span className="demo-badge" title={t('demo.note')}>
      {compact ? t('demo.short') : t('demo.badge')}
    </span>
  );
}
