import Icon from './Icon.jsx';
import { useI18n } from '../i18n/index.jsx';

// kind: 'demo' (sample content), 'prototype' (UI only, no real account), 'local' (changes stay in this tab)
export default function DemoNotice({ kind = 'demo', children }) {
  const { t } = useI18n();
  return (
    <aside className={`notice notice--${kind}`} role="note">
      <Icon name="leaf" size={20} />
      <p>{children ?? t(`notice.${kind}`)}</p>
    </aside>
  );
}
