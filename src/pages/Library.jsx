import PageHeader from '../components/PageHeader.jsx';
import SearchField from '../components/SearchField.jsx';
import ArticleCard from '../components/ArticleCard.jsx';
import Pagination from '../components/Pagination.jsx';
import DataLoader from '../components/DataLoader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Notice from '../components/Notice.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import useAsync from '../hooks/useAsync.js';
import useFilters from '../hooks/useFilters.js';
import { useI18n } from '../i18n/index.jsx';
import { queryArticles } from '../services/contentService.js';

const typeKeys = ['summary', 'caseStudy', 'cropGuide', 'livestockGuide', 'climate', 'implementation'];
const defaults = { q: '', type: 'all', sector: 'all', page: '1' };

export default function Library() {
  const { t } = useI18n();
  usePageTitle(t('library.title'));
  const { values, setValues, reset, activeCount } = useFilters(defaults);
  const result = useAsync(() => queryArticles({ ...values, pageSize: 6 }), [values.q, values.type, values.sector, values.page]);

  return (
    <>
      <PageHeader
        title={t('library.title')}
        description={t('library.desc')}
        demo
        crumbs={[{ label: t('nav.home'), to: '/' }, { label: t('nav.research'), to: '/research' }, { label: t('library.title') }]}
      />
      <section className="section section--compact">
        <div className="container">
          <Notice kind="demo" title={t('research.noticeTitle')}>
            {t('research.notice')}
          </Notice>
          <div className="toolbar">
            <SearchField label={t('research.searchLabel')} value={values.q} onChange={(q) => setValues({ q })} placeholder={t('research.searchPlaceholder')} />
            <div role="group" aria-label={t('research.filterLabel')} className="filter-chips">
              {['all', ...typeKeys].map((key) => (
                <button key={key} type="button" className={`chip-btn ${values.type === key ? 'is-active' : ''}`} aria-pressed={values.type === key} onClick={() => setValues({ type: key })}>
                  {key === 'all' ? t('research.all') : t(`research.types.${key}`)}
                </button>
              ))}
            </div>
            <div role="group" aria-label={t('explore.sector')} className="filter-chips">
              {['all', 'crop', 'livestock'].map((key) => (
                <button key={key} type="button" className={`chip-btn ${values.sector === key ? 'is-active' : ''}`} aria-pressed={values.sector === key} onClick={() => setValues({ sector: key })}>
                  {key === 'all' ? t('ui.all') : t(key === 'crop' ? 'featured.crop' : 'featured.livestock')}
                </button>
              ))}
            </div>
          </div>
          <div className="results-bar">
            <p className="results-bar__count" aria-live="polite">
              {result.data ? t('research.resultCount', { n: result.data.total }) : t('loading')}
            </p>
            {activeCount > 0 && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={reset}>
                {t('ui.clearFilters')}
              </button>
            )}
          </div>
          <DataLoader result={result}>
            {(data) =>
              data.items.length === 0 ? (
                <EmptyState
                  title={t('research.emptyTitle')}
                  body={t('research.emptyBody')}
                  action={
                    <button type="button" className="btn btn--primary btn--sm" onClick={reset}>
                      {t('research.reset')}
                    </button>
                  }
                />
              ) : (
                <>
                  <ul className="knowledge-list">
                    {data.items.map((a) => (
                      <li key={a.id}>
                        <ArticleCard article={a} />
                      </li>
                    ))}
                  </ul>
                  <Pagination page={data.page} pageCount={data.pageCount} onChange={(page) => setValues({ page })} />
                </>
              )
            }
          </DataLoader>
        </div>
      </section>
    </>
  );
}
