import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import PatternTile from '../components/PatternTile.jsx';
import InnovationCard from '../components/InnovationCard.jsx';
import Icon from '../components/Icon.jsx';
import Notice from '../components/Notice.jsx';
import DataLoader from '../components/DataLoader.jsx';
import NotFound from './NotFound.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import useAsync from '../hooks/useAsync.js';
import { useI18n } from '../i18n/index.jsx';
import { useBookmarks } from '../context/BookmarksContext.jsx';
import SaveButton from '../components/SaveButton.jsx';
import { getInnovation, listRelatedInnovations } from '../services/innovationService.js';
import { categoryById } from '../data/categories.js';
import { countryById } from '../data/countries.js';

function Detail({ item }) {
  const { t, loc } = useI18n();
  const { recordView } = useBookmarks();
  const related = useAsync(() => listRelatedInnovations(item.id), [item.id]);
  const title = loc(item.title);
  const category = categoryById[item.categoryId];
  const country = countryById[item.countryId];
  usePageTitle(title);

  useEffect(() => {
    recordView('innovation', item.id);
  }, [item.id, recordView]);

  return (
    <>
      <PageHeader
        title={title}
        description={loc(item.summary)}
        demo
        crumbs={[{ label: t('nav.home'), to: '/' }, { label: t('nav.explore'), to: '/explore' }, { label: title }]}
      >
        <SaveButton id={item.id} title={title} className="btn btn--ghost" />
      </PageHeader>

      <section className="section section--compact">
        <div className="container detail-grid">
          <div className="detail-main">
            <PatternTile tone={country?.tone ?? 'a'} className="detail-visual">
              <span className="detail-visual__icon">
                <Icon name={category?.icon ?? 'leaf'} size={34} />
              </span>
            </PatternTile>
            <p className="small muted">{t('detail.illustration')}</p>

            <h2>{t('detail.description')}</h2>
            <p>{loc(item.summary)}</p>

            <h2>{t('featured.benefits')}</h2>
            <ul className="check-list">
              {loc(item.benefits).map((b) => (
                <li key={b}>
                  <Icon name="check" size={18} />
                  {b}
                </li>
              ))}
            </ul>

            <h2>{t('detail.considerations')}</h2>
            <ul className="check-list check-list--caution">
              {loc(item.considerations).map((c) => (
                <li key={c}>
                  <Icon name="shield" size={18} />
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <aside className="detail-side" aria-label={t('detail.facts')}>
            <h2 className="side-heading">{t('detail.facts')}</h2>
            <dl className="facts">
              <div>
                <dt>{t('featured.origin')}</dt>
                <dd>{country && <Link to={`/countries/${country.id}`}>{loc(country.name)}</Link>}</dd>
              </div>
              <div>
                <dt>{t('featured.category')}</dt>
                <dd>{category && <Link to={`/categories/${category.id}`}>{loc(category.title)}</Link>}</dd>
              </div>
              <div>
                <dt>{t('explore.sector')}</dt>
                <dd>{t(item.sector === 'crop' ? 'featured.crop' : 'featured.livestock')}</dd>
              </div>
              <div>
                <dt>{t('detail.applications')}</dt>
                <dd>
                  <ul className="chips">
                    {item.applications.map((a) => (
                      <li key={a}>
                        <Link to={`/explore?application=${a}`}>{t(`applications.${a}`)}</Link>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt>{t('detail.added')}</dt>
                <dd>{item.added}</dd>
              </div>
            </dl>
            <Notice kind="demo">{t('detail.demoNote')}</Notice>
            <Link to="/explore" className="btn btn--ghost btn--sm">
              {t('ui.backToDirectory')}
            </Link>
          </aside>
        </div>
      </section>

      <section className="section section--tint section--compact" aria-labelledby="related-title">
        <div className="container">
          <h2 id="related-title">{t('detail.related')}</h2>
          <DataLoader result={related} rows={3}>
            {(items) => (
              <div className="grid grid--cards">
                {items.map((r) => (
                  <InnovationCard key={r.id} innovation={r} />
                ))}
              </div>
            )}
          </DataLoader>
        </div>
      </section>
    </>
  );
}

export default function InnovationDetail() {
  const { id } = useParams();
  const result = useAsync(() => getInnovation(id), [id]);
  if (result.status === 'success' && result.data === null) return <NotFound />;
  return (
    <DataLoader result={result}>{(item) => (item ? <Detail key={item.id} item={item} /> : null)}</DataLoader>
  );
}
