import { Link } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle.js';
import useAsync from '../../hooks/useAsync.js';
import DataLoader from '../../components/DataLoader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import InnovationCard from '../../components/InnovationCard.jsx';
import SaveButton from '../../components/SaveButton.jsx';
import { useI18n } from '../../i18n/index.jsx';
import { useBookmarks } from '../../context/BookmarksContext.jsx';
import { getInnovationsByIds } from '../../services/innovationService.js';
import { getArticle } from '../../services/contentService.js';

export default function Saved() {
  const { t, loc } = useI18n();
  usePageTitle(t('user.nav.saved'));
  const { ids, articleIds, loadError } = useBookmarks();
  const key = `${[...ids].join(',')}|${[...articleIds].join(',')}`;
  const result = useAsync(async () => ({
    innovations: await getInnovationsByIds([...ids]),
    articles: (await Promise.all([...articleIds].map(getArticle))).filter(Boolean),
  }), [key]);

  if (loadError) return <><h1>{t('user.nav.saved')}</h1><ErrorState error={loadError} /></>;
  return (
    <>
      <h1>{t('user.nav.saved')}</h1>
      <p className="lede">{t('saved.desc')}</p>
      <DataLoader result={result}>
        {({ innovations, articles }) => (innovations.length === 0 && articles.length === 0 ? (
          <EmptyState
            title={t('user.savedEmptyTitle')}
            body={t('user.savedEmptyBody')}
            action={<Link to="/explore" className="btn btn--primary btn--sm">{t('actions.explore')}</Link>}
          />
        ) : (
          <>
            {innovations.length > 0 && (
              <section aria-labelledby="saved-innov">
                <h2 id="saved-innov">{t('saved.innovations')}</h2>
                <div className="grid grid--cards">{innovations.map((i) => <InnovationCard key={i.id} innovation={i} />)}</div>
              </section>
            )}
            {articles.length > 0 && (
              <section aria-labelledby="saved-art" className="mt">
                <h2 id="saved-art">{t('saved.articles')}</h2>
                <ul className="stack">
                  {articles.map((a) => (
                    <li key={a.id} className="knowledge-item">
                      <h3><Link to={`/library/${a.id}`} className="card-link">{loc(a.title)}</Link></h3>
                      <p>{loc(a.summary)}</p>
                      <SaveButton kind="article" id={a.id} title={loc(a.title)} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        ))}
      </DataLoader>
    </>
  );
}
