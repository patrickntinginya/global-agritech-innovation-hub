import PreviewForm from '../../components/PreviewForm.jsx';
import usePageTitle from '../../hooks/usePageTitle.js';
import { useI18n } from '../../i18n/index.jsx';

const RULES = { siteName: ['required', { min: 3 }], contactEmail: ['required', 'email'], defaultLang: ['required'] };

export default function AdminSettings() {
  const { t } = useI18n();
  usePageTitle(t('admin.sections.settings.title'));
  const fields = [
    { name: 'siteName', labelKey: 'admin.settings.siteName' },
    { name: 'defaultLang', labelKey: 'admin.settings.defaultLang', type: 'select', options: [{ value: 'en', label: 'English' }, { value: 'sw', label: 'Kiswahili' }] },
    { name: 'contactEmail', labelKey: 'admin.settings.contactEmail', type: 'email', hintKey: 'admin.settings.contactHint' },
    { name: 'allowSubmissions', labelKey: 'admin.settings.allowSubmissions', type: 'checkbox' },
    { name: 'maintenance', labelKey: 'admin.settings.maintenance', type: 'checkbox' },
  ];
  return (
    <>
      <div className="admin-head"><div><h1>{t('admin.sections.settings.title')}</h1><p className="muted">{t('admin.sections.settings.desc')}</p></div></div>
      <div className="panel">
        <PreviewForm fields={fields} rules={RULES}
          initial={{ siteName: t('brand.name'), defaultLang: 'en', allowSubmissions: true }}
          submitLabel={t('admin.settings.preview')} resultKey="admin.settings.result" />
      </div>
    </>
  );
}
