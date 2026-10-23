import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import InnovationCard from '../components/InnovationCard.jsx';
import ArticleCard from '../components/ArticleCard.jsx';
import CourseCard from '../components/CourseCard.jsx';
import DataLoader from '../components/DataLoader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Icon from '../components/Icon.jsx';
import NotFound from './NotFound.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import useAsync from '../hooks/useAsync.js';
import { useI18n } from '../i18n/index.jsx';
import { listInnovationsBy } from '../services/innovationService.js';
import { listArticlesFor, listCoursesFor } from '../services/contentService.js';
import { categoryById, categories } from '../data/categories.js';

export default function CategoryPage() {
  const { id } = useParams();
  const { t, loc } = useI18n();
  const category = categoryById[id];
  const name = category ? loc(category.title) : '';
  usePageTitle(name || t('notFound.title'));
  const items = useAsync(() => (category ? listInnovationsBy('categoryId', id) : Promise.resolve([])), [id]);
  const articles = useAsync(() => (category ? listArticlesFor({ categoryId: id }) : Promise.resolve([])), [id]);
  const courses = useAsync(() => (category ? listCoursesFor({ categoryId: id }) : Promise.resolve([])), [id]);

  if (!category) return <NotFound />;

  return (
    <>
      <PageHeader
        title={name}
        description={t('categoryPage.intro', { name })}
        demo
        crumbs={[{ label: t('nav.home'), to: '/' }, { label: t('categories.title'), to: '/categories' }, { label: name }]}
      >
        <span className="category-card__icon category-card__icon--lg">
          <Icon name={category.icon} size={32} />
        </span>
      </PageHeader>

      <section className="section section--compact" aria-labelledby="cat-innovations">
        <div className="container">
          <h2 id="cat-innovations">{t('categoryPage.innovations', { name })}</h2>
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
            <Link to={`/explore?category=${id}`} className="btn btn--ghost btn--sm">
              {t('categoryPage.filterInDirectory')}
              <Icon name="arrow" size={16} />
            </Link>
          </p>
        </div>
      </section>

      <section className="section section--tint section--compact" aria-labelledby="cat-research">
        <div className="container">
          <h2 id="cat-research">{t('categoryPage.research')}</h2>
          <DataLoader result={articles} rows={2}>
            {(list) =>
              list.length === 0 ? (
                <p className="muted">{t('categoryPage.noRelated')}</p>
              ) : (
                <ul className="knowledge-list">
                  {list.map((a) => (
                    <li key={a.id}>
                      <ArticleCard article={a} />
                    </li>
                  ))}
                </ul>
              )
            }
          </DataLoader>
        </div>
      </section>

      <section className="section section--compact" aria-labelledby="cat-courses">
        <div className="container">
          <h2 id="cat-courses">{t('categoryPage.courses')}</h2>
          <DataLoader result={courses} rows={2}>
            {(list) =>
              list.length === 0 ? (
                <p className="muted">{t('categoryPage.noRelated')}</p>
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

      <section className="section section--tint section--compact" aria-labelledby="cat-other">
        <div className="container">
          <h2 id="cat-other">{t('categoryPage.otherCategories')}</h2>
          <ul className="chips chips--wrap">
            {categories
              .filter((c) => c.id !== id)
              .map((c) => (
                <li key={c.id}>
                  <Link to={`/categories/${c.id}`}>{loc(c.title)}</Link>
                </li>
              ))}
          </ul>
        </div>
      </section>
    </>
  );
}
