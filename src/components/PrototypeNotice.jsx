import { useI18n } from '../i18n/index.jsx';

// kind: 'noBackend' | 'auth' | 'admin'. Used wherever a screen could be mistaken for a working feature.
export default function PrototypeNotice({ kind = 'noBackend' }) {
  const { t } = useI18n();
  return (
    <aside className="notice" role="note">
      <strong>{t(`notices.${kind}.title`)}</strong> {t(`notices.${kind}.body`)}
    </aside>
  );
}
