import { Link } from 'react-router-dom';
import DemoBadge from './DemoBadge.jsx';
import { useI18n } from '../i18n/index.jsx';

export default function ArticleCard({ article }) {
  const { t, loc } = useI18n();
  return (
    <article className="knowledge-item">
      <span className="knowledge-item__type">{t(`research.types.${article.type}`)}</span>
      <h3>
        <Link to={`/library/${article.id}`} className="card-link">
          {loc(article.title)}
        </Link>
      </h3>
      <p>{loc(article.summary)}</p>
      <div className="knowledge-item__foot">
        <DemoBadge compact />
        <span className="small muted">{t('ui.readMinutes', { n: article.minutes })}</span>
      </div>
    </article>
  );
}
