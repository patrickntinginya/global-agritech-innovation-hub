import { useI18n } from '../i18n/index.jsx';

export default function ViewToggle({ value, onChange }) {
  const { t } = useI18n();
  return (
    <div className="view-toggle" role="group" aria-label={t('ui.view')}>
      {['grid', 'list'].map((v) => (
        <button key={v} type="button" className={`chip-btn ${value === v ? 'is-active' : ''}`} aria-pressed={value === v} onClick={() => onChange(v)}>
          {t(v === 'grid' ? 'ui.gridView' : 'ui.listView')}
        </button>
      ))}
    </div>
  );
}
