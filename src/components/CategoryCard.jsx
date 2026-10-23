import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import { useI18n } from '../i18n/index.jsx';

export default function CategoryCard({ category, count }) {
  const { t, loc } = useI18n();
  return (
    <Link className="category-card" to={`/categories/${category.id}`}>
      <span className="category-card__icon">
        <Icon name={category.icon} size={26} />
      </span>
      <span className="category-card__title">{loc(category.title)}</span>
      {count != null && <span className="category-card__count">{t('ui.itemsCount', { n: count })}</span>}
    </Link>
  );
}
