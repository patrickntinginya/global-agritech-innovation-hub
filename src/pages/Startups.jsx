import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import SearchField from '../components/SearchField.jsx';
import { FilterSelect } from '../components/forms.jsx';
import DataLoader from '../components/DataLoader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import DemoBadge from '../components/DemoBadge.jsx';
import Notice from '../components/Notice.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import useAsync from '../hooks/useAsync.js';
import useFilters from '../hooks/useFilters.js';
import { useI18n } from '../i18n/index.jsx';
import { queryStartups } from '../services/contentService.js';
import { startupStages, startupFocuses } from '../data/startups.js';
import { countryById } from '../data/countries.js';
import { categoryById } from '../data/categories.js';
import { innovations } from '../data/innovations.js';

const defaults = { q: '', stage: 'all', focus: 'all' };

export default function Startups() {
  const { t, loc } = useI18n();
  usePageTitle(t('startups.title'));
  const { values, setValues, reset, activeCount } = useFilters(defaults);
  const result = useAsync(() => queryStartups(values), [values.q, values.stage, values.focus]);
  const all = { value: 'all', label: t('ui.all') };

  return (
    <>
      <PageHeader
        title={t('startups.title')}
        description={t('startups.desc')}
        demo
        crumbs={[{ label: t('nav.home'), to: '/' }, { label: t('nav.startups') }]}
      >
        <Link to="/submit?type=startup" className="btn btn--primary">
          {t('startups.submit')}
        </Link>
        <Link to="/partnerships" className="btn btn--ghost">
          {t('startups.seePartnerships')}
        </Link>
      </PageHeader>
      <section className="section section--compact">
        <div className="container">
          <Notice kind="demo" title={t('startups.noticeTitle')}>
            {t('startups.notice')}
          </Notice>
          <div className="filters">
            <div className="filters__top">
              <SearchField label={t('startups.searchLabel')} value={values.q} onChange={(q) => setValues({ q })} placeholder={t('startups.searchPlaceholder')} />
            </div>
            <div className="filters__panel is-open filters__panel--always">
              <FilterSelect label={t('startups.stageLabel')} value={values.stage} onChange={(stage) => setValues({ stage })} options={[all, ...startupStages.map((s) => ({ value: s, label: t(`startups.stage.${s}`) }))]} />
              <FilterSelect label={t('startups.focus')} value={values.focus} onChange={(focus) => setValues({ focus })} options={[all, ...startupFocuses.map((s) => ({ value: s, label: loc(categoryById[s].title) }))]} />
            </div>
          </div>
          <div className="results-bar">
            <p className="results-bar__count" aria-live="polite">
              {result.data ? t('ui.results', { n: result.data.length }) : t('loading')}
            </p>
            {activeCount > 0 && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={reset}>
                {t('ui.clearFilters')}
              </button>
            )}
          </div>
          <DataLoader result={result}>
            {(list) =>
              list.length === 0 ? (
                <EmptyState title={t('startups.emptyTitle')} body={t('startups.emptyBody')} />
              ) : (
                <div className="grid grid--cards">
                  {list.map((s) => (
                    <article key={s.id} className="card startup-card">
                      <div className="card__body">
                        <div className="expert-card__top">
                          <h3>{s.name}</h3>
                          <DemoBadge compact />
                        </div>
                        <p className="small muted">{loc(countryById[s.countryId].name)}</p>
                        <ul className="chips">
                          <li>{t(`startups.stage.${s.stage}`)}</li>
                          <li>{loc(categoryById[s.focus].title)}</li>
                        </ul>
                        <p>{loc(s.summary)}</p>
                        <p className="benefits__label">{t('startups.looking')}</p>
                        <ul className="plain-list">
                          {loc(s.needs).map((n) => (
                            <li key={n}>{n}</li>
                          ))}
                        </ul>
                        <p className="benefits__label">{t('startups.solutions')}</p>
                        <ul className="plain-list">
                          {s.innovationIds.map((id) => {
                            const inn = innovations.find((i) => i.id === id);
                            return (
                              <li key={id}>
                                <Link to={`/innovations/${id}`}>{loc(inn.title)}</Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </article>
                  ))}
                </div>
              )
            }
          </DataLoader>
        </div>
      </section>
    </>
  );
}
