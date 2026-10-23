import PageHeader from '../components/PageHeader.jsx';
import SearchField from '../components/SearchField.jsx';
import { FilterSelect } from '../components/forms.jsx';
import CourseCard from '../components/CourseCard.jsx';
import DataLoader from '../components/DataLoader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Notice from '../components/Notice.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import useAsync from '../hooks/useAsync.js';
import useFilters from '../hooks/useFilters.js';
import { useI18n } from '../i18n/index.jsx';
import { queryCourses } from '../services/contentService.js';
import { courseTopics } from '../data/courses.js';

const defaults = { q: '', level: 'all', topic: 'all' };

export default function Courses() {
  const { t } = useI18n();
  usePageTitle(t('nav.learning'));
  const { values, setValues, reset, activeCount } = useFilters(defaults);
  const result = useAsync(() => queryCourses(values), [values.q, values.level, values.topic]);
  const all = { value: 'all', label: t('ui.all') };

  return (
    <>
      <PageHeader title={t('nav.learning')} description={t('learning.desc')} demo crumbs={[{ label: t('nav.home'), to: '/' }, { label: t('nav.learning') }]} />
      <section className="section section--compact">
        <div className="container">
          <Notice kind="demo" title={t('courses.noticeTitle')}>
            {t('learning.note')}
          </Notice>
          <div className="filters">
            <div className="filters__top">
              <SearchField label={t('courses.searchLabel')} value={values.q} onChange={(q) => setValues({ q })} placeholder={t('courses.searchPlaceholder')} />
            </div>
            <div className="filters__panel is-open filters__panel--always">
              <FilterSelect
                label={t('courses.topic')}
                value={values.topic}
                onChange={(topic) => setValues({ topic })}
                options={[all, ...courseTopics.map((k) => ({ value: k, label: t(`courses.topics.${k}`) }))]}
              />
              <FilterSelect
                label={t('courses.level')}
                value={values.level}
                onChange={(level) => setValues({ level })}
                options={[all, ...['beginner', 'intermediate', 'advanced'].map((k) => ({ value: k, label: t(`learning.level.${k}`) }))]}
              />
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
                <EmptyState
                  title={t('courses.emptyTitle')}
                  body={t('courses.emptyBody')}
                  action={
                    <button type="button" className="btn btn--primary btn--sm" onClick={reset}>
                      {t('ui.clearFilters')}
                    </button>
                  }
                />
              ) : (
                <div className="grid grid--cards">
                  {list.map((c) => (
                    <CourseCard key={c.id} course={c} />
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
