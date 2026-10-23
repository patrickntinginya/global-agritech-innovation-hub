import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import PatternTile from './PatternTile.jsx';
import DemoBadge from './DemoBadge.jsx';
import { useBookmarks } from '../context/BookmarksContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { categoryById } from '../data/categories.js';
import { countryById } from '../data/countries.js';

export default function InnovationCard({ innovation, view = 'grid' }) {
  const { t, loc } = useI18n();
  const { has, toggle } = useBookmarks();
  const saved = has(innovation.id);
  const title = loc(innovation.title);
  const category = categoryById[innovation.categoryId];
  const country = countryById[innovation.countryId];
  const sectorLabel = t(innovation.sector === 'crop' ? 'featured.crop' : 'featured.livestock');

  return (
    <article className={`card innovation-card innovation-card--${innovation.sector} ${view === 'list' ? 'innovation-card--list' : ''}`}>
      <PatternTile tone={country?.tone ?? 'a'}>
        <DemoBadge compact />
      </PatternTile>
      <div className="card__body">
        <p className="sector-tag">{sectorLabel}</p>
        <h3>
          <Link to={`/innovations/${innovation.id}`} className="card-link">
            {title}
          </Link>
        </h3>
        <dl className="meta">
          <div>
            <dt>{t('featured.origin')}</dt>
            <dd>{country ? loc(country.name) : ''}</dd>
          </div>
          <div>
            <dt>{t('featured.category')}</dt>
            <dd>{category ? loc(category.title) : ''}</dd>
          </div>
        </dl>
        <p>{loc(innovation.summary)}</p>
        <div className="benefits">
          <p className="benefits__label">{t('featured.benefits')}</p>
          <ul>
            {loc(innovation.benefits).map((b) => (
              <li key={b}>
                <Icon name="check" size={16} />
                {b}
              </li>
            ))}
          </ul>
        </div>
        <div className="card__actions">
          <Link className="btn btn--primary btn--sm" to={`/innovations/${innovation.id}`}>
            {t('actions.viewDetails')}
            <span className="visually-hidden">: {title}</span>
          </Link>
          <button
            type="button"
            className={`btn btn--ghost btn--sm ${saved ? 'is-saved' : ''}`}
            aria-pressed={saved}
            aria-label={t(saved ? 'a11y.unsaveItem' : 'a11y.saveItem', { title })}
            onClick={() => toggle(innovation.id)}
          >
            <Icon name="bookmark" size={16} className={saved ? 'icon--filled' : ''} />
            {t(saved ? 'actions.saved' : 'actions.save')}
          </button>
        </div>
      </div>
    </article>
  );
}
