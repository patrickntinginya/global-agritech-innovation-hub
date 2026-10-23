import Notice from '../../components/Notice.jsx';
import usePageTitle from '../../hooks/usePageTitle.js';
import { useI18n } from '../../i18n/index.jsx';

// Not implemented in Phase 2. File uploads need a Supabase Storage bucket with its own policies, which is listed under
// "Not done" in the README. Nothing on this screen pretends otherwise.
export default function AdminMedia() {
  const { t } = useI18n();
  usePageTitle(t('admin.sections.media.title'));
  return (
    <>
      <div className="admin-head"><div><h1>{t('admin.sections.media.title')}</h1><p className="muted">{t('admin.sections.media.desc')}</p></div></div>
      <Notice kind="backend" title={t('admin.media.notConnectedTitle')}>{t('admin.media.notConnectedBody')}</Notice>
    </>
  );
}
