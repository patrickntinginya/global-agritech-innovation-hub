import { useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import SearchField from '../components/SearchField.jsx';
import { FilterSelect } from '../components/forms.jsx';
import ViewToggle from '../components/ViewToggle.jsx';
import InnovationCard from '../components/InnovationCard.jsx';
import Pagination from '../components/Pagination.jsx';
import DataLoader from '../components/DataLoader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Notice from '../components/Notice.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import useAsync from '../hooks/useAsync.js';
import useFilters from '../hooks/useFilters.js';
import { useI18n } from '../i18n/index.jsx';
import { queryInnovations } from '../services/innovationService.js';
import { categories } from '../data/categories.js';
import { countries } from '../data/countries.js';
import { applications } from '../data/applications.js';

const defaults = { q: '', category: 'all', country: 'all', sector: 'all', application: 'all', sort: 'newest', view: 'grid', page: '1' };

export default function Explore() {
  const { t, loc } = useI18n();
  usePageTitle(t('nav.explore'));
  const { values, setValues, reset, activeCount } = useFilters(defaults);
  const [panelOpen, setPanelOpen] = useState(false);

  const result = useAsync(
    () => queryInnovations({ ...values, pageSize: 6 }),
    [values.q, values.category, values.country, values.sector, values.application, values.sort, values.page],
  );

  const all = { value: 'all', label: t('ui.all') };
  const opts = {
    category: [all, ...categories.map((c) => ({ value: c.id, label: loc(c.title) }))],
    country: [all, ...countries.map((c) => ({ value: c.id, label: loc(c.name) }))],
    sector: [all, { value: 'crop', label: t('featured.crop') }, { value: 'livestock', label: t('featured.livestock') }],
    application: [all, ...applications.map((a) => ({ value: a, label: t(`applications.${a}`) }))],
    sort: [
      { value: 'newest', label: t('explore.sortNewest') },
      { value: 'alpha', label: t('explore.sortAlpha') },
      { value: 'category', label: t('explore.sortCategory') },
    ],
  };

  return (
    <>
      <PageHeader
        title={t('nav.explore')}
        description={t('explore.desc')}
        demo
        crumbs={[{ label: t('nav.home'), to: '/' }, { label: t('nav.explore') }]}
      />
      <section className="section section--compact" aria-label={t('explore.directory')}>
        <div className="container">
          <div className="filters">
            <div className="filters__top">
              <SearchField label={t('explore.searchLabel')} value={values.q} onChange={(q) => setValues({ q })} placeholder={t('explore.searchPlaceholder')} />
              <button
                type="button"
                className="btn btn--ghost btn--sm filters__toggle"
                aria-expanded={panelOpen}
                aria-controls="filter-panel"
                onClick={() => setPanelOpen((v) => !v)}
              >
                {t('ui.filters')}
                {activeCount > 0 && <span className="count-pill">{activeCount}</span>}
              </button>
            </div>
            <div id="filter-panel" className={`filters__panel ${panelOpen ? 'is-open' : ''}`}>
              <FilterSelect label={t('explore.category')} value={values.category} onChange={(category) => setValues({ category })} options={opts.category} />
              <FilterSelect label={t('explore.country')} value={values.country} onChange={(country) => setValues({ country })} options={opts.country} />
              <FilterSelect label={t('explore.sector')} value={values.sector} onChange={(sector) => setValues({ sector })} options={opts.sector} />
              <FilterSelect label={t('explore.application')} value={values.application} onChange={(application) => setValues({ application })} options={opts.application} />
              <FilterSelect label={t('ui.sortBy')} value={values.sort} onChange={(sort) => setValues({ sort })} options={opts.sort} />
            </div>
          </div>

          <div className="results-bar" id="results">
            <p className="results-bar__count" aria-live="polite">
              {result.data ? t('ui.results', { n: result.data.total }) : t('loading')}
            </p>
            <div className="results-bar__actions">
              {activeCount > 0 && (
                <button type="button" className="btn btn--ghost btn--sm" onClick={reset}>
                  {t('ui.clearFilters')}
                </button>
              )}
              <ViewToggle value={values.view} onChange={(view) => setValues({ view })} />
            </div>
          </div>

          <DataLoader result={result}>
            {(data) =>
              data.items.length === 0 ? (
                <EmptyState
                  title={t('explore.emptyTitle')}
                  body={t('explore.emptyBody')}
                  action={
                    <button type="button" className="btn btn--primary btn--sm" onClick={reset}>
                      {t('ui.clearFilters')}
                    </button>
                  }
                />
              ) : (
                <>
                  <div className={values.view === 'list' ? 'stack' : 'grid grid--cards'}>
                    {data.items.map((item) => (
                      <InnovationCard key={item.id} innovation={item} view={values.view} />
                    ))}
                  </div>
                  <Pagination
                    page={data.page}
                    pageCount={data.pageCount}
                    onChange={(page) => {
                      setValues({ page });
                      document.getElementById('results')?.scrollIntoView({ block: 'start' });
                    }}
                  />
                </>
              )
            }
          </DataLoader>
          <Notice kind="demo">{t('demo.note')}</Notice>
        </div>
      </section>
    </>
  );
}
