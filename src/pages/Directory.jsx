import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import CountryCard from '../components/CountryCard.jsx';
import DataLoader from '../components/DataLoader.jsx';
import Notice from '../components/Notice.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import useAsync from '../hooks/useAsync.js';
import { useI18n } from '../i18n/index.jsx';
import { listInnovations } from '../services/innovationService.js';
import { countries } from '../data/countries.js';
import { categories } from '../data/categories.js';

export default function Directory() {
  const { t, loc } = useI18n();
  usePageTitle(t('directory.title'));
  const result = useAsync(listInnovations, []);
  return (
    <>
      <PageHeader
        title={t('directory.title')}
        description={t('directory.desc')}
        demo
        crumbs={[{ label: t('nav.home'), to: '/' }, { label: t('directory.title') }]}
      />
      <section className="section section--compact">
        <div className="container">
          <DataLoader result={result}>
            {(items) => (
              <>
                <div className="grid grid--countries">
                  {countries.map((c) => (
                    <CountryCard key={c.id} country={c} count={items.filter((i) => i.countryId === c.id).length} />
                  ))}
                </div>

                <h2 className="mt">{t('directory.matrixTitle')}</h2>
                <p className="muted">{t('directory.matrixDesc')}</p>
                <div className="table-wrap" tabIndex={0} role="region" aria-label={t('directory.matrixTitle')}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th scope="col">{t('featured.category')}</th>
                        {countries.map((c) => (
                          <th scope="col" key={c.id}>
                            <Link to={`/countries/${c.id}`}>{loc(c.name)}</Link>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((cat) => (
                        <tr key={cat.id}>
                          <th scope="row">
                            <Link to={`/categories/${cat.id}`}>{loc(cat.title)}</Link>
                          </th>
                          {countries.map((c) => {
                            const n = items.filter((i) => i.categoryId === cat.id && i.countryId === c.id).length;
                            return (
                              <td key={c.id} className={n ? 'has-count' : ''}>
                                {n ? <Link to={`/explore?category=${cat.id}&country=${c.id}`}>{n}</Link> : <span aria-label={t('directory.none')}>-</span>}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </DataLoader>
          <Notice kind="demo">{t('demo.note')}</Notice>
        </div>
      </section>
    </>
  );
}
