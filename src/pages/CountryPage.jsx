import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import InnovationCard from '../components/InnovationCard.jsx';
import DataLoader from '../components/DataLoader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Notice from '../components/Notice.jsx';
import NotFound from './NotFound.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import useAsync from '../hooks/useAsync.js';
import { useI18n } from '../i18n/index.jsx';
import { listInnovationsBy } from '../services/innovationService.js';
import { countryById, countries } from '../data/countries.js';

export default function CountryPage() {
  const { id } = useParams();
  const { t, loc } = useI18n();
  const country = countryById[id];
  const name = country ? loc(country.name) : '';
  usePageTitle(name || t('notFound.title'));
  const items = useAsync(() => (country ? listInnovationsBy('countryId', id) : Promise.resolve([])), [id]);
  if (!country) return <NotFound />;
  return (
    <>
      <PageHeader
        title={name}
        description={loc(country.description)}
        demo
        crumbs={[{ label: t('nav.home'), to: '/' }, { label: t('directory.title'), to: '/directory' }, { label: name }]}
      />
      <section className="section section--compact">
        <div className="container">
          <Notice kind="demo" title={t('countryPage.noticeTitle')}>
            {t('countryPage.notice')}
          </Notice>
          <h2 className="mt">{t('countryPage.innovations', { name })}</h2>
          <DataLoader result={items}>
            {(list) =>
              list.length === 0 ? (
                <EmptyState title={t('categoryPage.emptyTitle')} body={t('categoryPage.emptyBody')} />
              ) : (
                <div className="grid grid--cards">
                  {list.map((i) => (
                    <InnovationCard key={i.id} innovation={i} />
                  ))}
                </div>
              )
            }
          </DataLoader>
          <p>
            <Link to={`/explore?country=${id}`} className="btn btn--ghost btn--sm">
              {t('categoryPage.filterInDirectory')}
            </Link>
          </p>
          <h2 className="mt">{t('countryPage.otherRegions')}</h2>
          <ul className="chips chips--wrap">
            {countries
              .filter((c) => c.id !== id)
              .map((c) => (
                <li key={c.id}>
                  <Link to={`/countries/${c.id}`}>{loc(c.name)}</Link>
                </li>
              ))}
          </ul>
        </div>
      </section>
    </>
  );
}
