import { Link, useSearchParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import SearchField from '../components/SearchField.jsx';
import DataLoader from '../components/DataLoader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Icon from '../components/Icon.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import useAsync from '../hooks/useAsync.js';
import { useI18n } from '../i18n/index.jsx';
import { searchAll } from '../services/contentService.js';
import { categories } from '../data/categories.js';
import { countryById } from '../data/countries.js';

function Group({ id, title, count, children }) {
  return (
    <section className="search-group" aria-labelledby={`sg-${id}`}>
      <h2 id={`sg-${id}`}>
        {title} <span className="count-pill">{count}</span>
      </h2>
      <ul className="stack">{children}</ul>
    </section>
  );
}

export default function SearchResults() {
  const { t, loc } = useI18n();
  usePageTitle(t('search.title'));
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const result = useAsync(() => searchAll(q), [q]);
  const setQ = (value) => setParams(value ? { q: value } : {}, { replace: true });

  return (
    <>
      <PageHeader title={t('search.title')} description={t('search.pageDesc')} demo crumbs={[{ label: t('nav.home'), to: '/' }, { label: t('search.title') }]} />
      <section className="section section--compact">
        <div className="container">
          <SearchField label={t('a11y.searchLabel')} value={q} onChange={setQ} placeholder={t('search.placeholder')} />
          {!q.trim() ? (
            <div className="mt">
              <EmptyState title={t('search.startTitle')} body={t('search.startBody')} />
              <h2 className="mt">{t('search.tryCategories')}</h2>
              <ul className="chips chips--wrap">
                {categories.slice(0, 8).map((c) => (
                  <li key={c.id}>
                    <Link to={`/categories/${c.id}`}>{loc(c.title)}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <DataLoader result={result}>
              {(data) => {
                const total = data.innovations.length + data.articles.length + data.courses.length + data.experts.length + data.startups.length;
                if (total === 0) {
                  return <EmptyState title={t('search.noneTitle', { q })} body={t('search.noneBody')} />;
                }
                return (
                  <>
                    <p className="results-bar__count" aria-live="polite">
                      {t('search.total', { n: total, q })}
                    </p>
                    {data.innovations.length > 0 && (
                      <Group id="innovations" title={t('search.groups.innovations')} count={data.innovations.length}>
                        {data.innovations.map((i) => (
                          <li key={i.id} className="search-hit">
                            <Link to={`/innovations/${i.id}`}>{loc(i.title)}</Link>
                            <p>{loc(i.summary)}</p>
                            <p className="small muted">{loc(countryById[i.countryId].name)}</p>
                          </li>
                        ))}
                      </Group>
                    )}
                    {data.articles.length > 0 && (
                      <Group id="articles" title={t('search.groups.articles')} count={data.articles.length}>
                        {data.articles.map((a) => (
                          <li key={a.id} className="search-hit">
                            <Link to={`/library/${a.id}`}>{loc(a.title)}</Link>
                            <p>{loc(a.summary)}</p>
                            <p className="small muted">{t(`research.types.${a.type}`)}</p>
                          </li>
                        ))}
                      </Group>
                    )}
                    {data.courses.length > 0 && (
                      <Group id="courses" title={t('search.groups.courses')} count={data.courses.length}>
                        {data.courses.map((c) => (
                          <li key={c.id} className="search-hit">
                            <Link to={`/courses/${c.id}`}>{loc(c.title)}</Link>
                            <p>{loc(c.description)}</p>
                          </li>
                        ))}
                      </Group>
                    )}
                    {data.experts.length > 0 && (
                      <Group id="experts" title={t('search.groups.experts')} count={data.experts.length}>
                        {data.experts.map((e) => (
                          <li key={e.id} className="search-hit">
                            <Link to="/experts">{e.name}</Link>
                            <p>{loc(e.title)}</p>
                          </li>
                        ))}
                      </Group>
                    )}
                    {data.startups.length > 0 && (
                      <Group id="startups" title={t('search.groups.startups')} count={data.startups.length}>
                        {data.startups.map((s) => (
                          <li key={s.id} className="search-hit">
                            <Link to="/startups">{s.name}</Link>
                            <p>{loc(s.summary)}</p>
                          </li>
                        ))}
                      </Group>
                    )}
                  </>
                );
              }}
            </DataLoader>
          )}
        </div>
      </section>
    </>
  );
}
