import { Link } from 'react-router-dom';
import PatternTile from './PatternTile.jsx';
import DemoBadge from './DemoBadge.jsx';
import Icon from './Icon.jsx';
import { useI18n } from '../i18n/index.jsx';

export default function CountryCard({ country, count }) {
  const { t, loc } = useI18n();
  return (
    <article className="card country-card">
      <PatternTile tone={country.tone}>
        <DemoBadge compact />
      </PatternTile>
      <div className="card__body">
        <h3>{loc(country.name)}</h3>
        <p>{loc(country.description)}</p>
        {count != null && <p className="small muted">{t('ui.itemsCount', { n: count })}</p>}
        <Link className="btn btn--ghost btn--sm" to={`/countries/${country.id}`}>
          {t('actions.exploreCountry')}
          <span className="visually-hidden"> {loc(country.name)}</span>
          <Icon name="arrow" size={16} />
        </Link>
      </div>
    </article>
  );
}
