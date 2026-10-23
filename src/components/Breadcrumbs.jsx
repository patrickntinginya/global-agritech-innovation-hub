import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/index.jsx';

export default function Breadcrumbs({ items }) {
  const { t } = useI18n();
  return (
    <nav className="breadcrumbs" aria-label={t('ui.breadcrumb')}>
      <ol>
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`}>
            {item.to ? <Link to={item.to}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
