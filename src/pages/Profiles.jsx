import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import PrototypeNotice from '../components/PrototypeNotice.jsx';
import NotFound from './NotFound.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import useAsync from '../hooks/useAsync.js';
import { useI18n } from '../i18n/index.jsx';
import { getOrganization, getStartup, listOpportunities } from '../services/contentService.js';
import { categoryById } from '../data/categories.js';
import { countryById } from '../data/countries.js';

export function StartupProfile() {
  const { id } = useParams();
  const { t, loc } = useI18n();
  const state = useAsync(() => getStartup(id), [id]);
  const s = state.data;
  usePageTitle(s ? s.name : t('startups.title'));
  if (state.error) return <div className="container page-body"><ErrorState onRetry={state.retry} /></div>;
  if (state.loading && !s) return <div className="container page-body"><LoadingState rows={2} /></div>;
  if (!s) return <NotFound />;
  return (
    <>
      <PageHeader title={s.name} description={loc(s.summary)} demo crumbs={[{ label: t('startups.title'), to: '/startups' }, { label: s.name }]} />
      <div className="container page-body detail-grid">
        <div className="detail-main">
          <PrototypeNotice kind="startups" />
          <h2>{t('startups.solutionsTitle')}</h2>
          <ul className="check-list">{loc(s.solutions).map((x) => <li key={x}>{x}</li>)}</ul>
          <p><Link to={`/categories/${s.categoryId}`}>{loc(categoryById[s.categoryId].title)}</Link></p>
        </div>
        <aside className="detail-aside">
          <dl className="facts">
            <div><dt>{t('startups.stageLabel')}</dt><dd>{t(`startups.stage.${s.stage}`)}</dd></div>
            <div><dt>{t('featured.origin')}</dt><dd>{loc(countryById[s.countryId].name)}</dd></div>
          </dl>
          <Link to="/startups" className="btn btn--ghost">{t('startups.back')}</Link>
        </aside>
      </div>
    </>
  );
}

export function OrganizationProfile() {
  const { id } = useParams();
  const { t, loc } = useI18n();
  const state = useAsync(() => getOrganization(id), [id]);
  const opps = useAsync(() => listOpportunities(), []);
  const o = state.data;
  usePageTitle(o ? loc(o.name) : t('partners.title'));
  if (state.error) return <div className="container page-body"><ErrorState onRetry={state.retry} /></div>;
  if (state.loading && !o) return <div className="container page-body"><LoadingState rows={2} /></div>;
  if (!o) return <NotFound />;
  const mine = (opps.data ?? []).filter((x) => x.organizationId === o.id);
  return (
    <>
      <PageHeader title={loc(o.name)} description={loc(o.summary)} demo crumbs={[{ label: t('partners.title'), to: '/partnerships' }, { label: loc(o.name) }]} />
      <div className="container page-body detail-grid">
        <div className="detail-main">
          <PrototypeNotice kind="startups" />
          <h2>{t('partnerships.opportunities')}</h2>
          {mine.length === 0 ? <p className="muted">{t('partnerships.noOpportunities')}</p> : (
            <ul className="solution-list">{mine.map((m) => <li key={m.id}><strong>{loc(m.title)}</strong><br />{loc(m.summary)}</li>)}</ul>
          )}
        </div>
        <aside className="detail-aside">
          <dl className="facts">
            <div><dt>{t('partnerships.kindLabel')}</dt><dd>{t(`partnerships.kind.${o.kind}`)}</dd></div>
            <div><dt>{t('featured.origin')}</dt><dd>{loc(countryById[o.countryId].name)}</dd></div>
          </dl>
          <Link to="/partnerships" className="btn btn--ghost">{t('partnerships.back')}</Link>
        </aside>
      </div>
    </>
  );
}
