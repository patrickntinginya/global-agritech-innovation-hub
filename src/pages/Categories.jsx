import PageHeader from '../components/PageHeader.jsx';
import CategoryCard from '../components/CategoryCard.jsx';
import DataLoader from '../components/DataLoader.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import useAsync from '../hooks/useAsync.js';
import { useI18n } from '../i18n/index.jsx';
import { listInnovations } from '../services/innovationService.js';
import { categories } from '../data/categories.js';

export default function Categories() {
  const { t } = useI18n();
  usePageTitle(t('categories.title'));
  const result = useAsync(listInnovations, []);
  return (
    <>
      <PageHeader title={t('categories.title')} description={t('categories.desc')} crumbs={[{ label: t('nav.home'), to: '/' }, { label: t('categories.title') }]} />
      <section className="section section--compact">
        <div className="container">
          <DataLoader result={result}>
            {(items) => (
              <div className="grid grid--categories">
                {categories.map((c) => (
                  <CategoryCard key={c.id} category={c} count={items.filter((i) => i.categoryId === c.id).length} />
                ))}
              </div>
            )}
          </DataLoader>
        </div>
      </section>
    </>
  );
}
